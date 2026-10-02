#:property PublishAot=false

using System.Buffers.Binary;
using System.Globalization;
using System.Reflection.PortableExecutable;
using System.Security.Cryptography;
using System.Text.Json;

// Independent offline PE validation. This program never opens a game process.
const string ExpectedHash = "671de22649274b49fa07f5a246bc7252c4e08bb9ab623d2e65722fbab4e497a4";
try
{
    if (args.Length < 2 || args.Length > 33)
        throw new ArgumentException("Usage: dotnet InspectNativeCandidates.cs -- executable-path hex-rva [hex-rva ...]; maximum 32 candidates");
    using var stream = new FileStream(args[0], FileMode.Open, FileAccess.Read, FileShare.Read);
    if (stream.Length > 128 * 1024 * 1024)
        throw new InvalidDataException("Executable exceeds the 128 MiB research bound");
    var hash = Convert.ToHexString(SHA256.HashData(stream)).ToLowerInvariant();
    if (hash != ExpectedHash)
        throw new InvalidDataException("Unsupported executable fingerprint");
    stream.Position = 0;
    using var pe = new PEReader(stream, PEStreamOptions.LeaveOpen);
    var header = pe.PEHeaders.PEHeader ?? throw new InvalidDataException("Missing PE header");
    if (header.Magic != PEMagic.PE32Plus || pe.PEHeaders.CoffHeader.Machine != Machine.Amd64)
        throw new InvalidDataException("Expected an AMD64 PE32+ image");
    var directory = header.ExceptionTableDirectory;
    if (directory.Size <= 0 || directory.Size > 16 * 1024 * 1024 || directory.Size % 12 != 0)
        throw new InvalidDataException("Invalid exception-directory bound");
    var unwind = pe.GetSectionData(directory.RelativeVirtualAddress).GetContent(0, directory.Size).AsSpan();
    var rows = new List<object>();
    foreach (var rawRva in args.Skip(1))
    {
        var normalized = rawRva.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? rawRva[2..] : rawRva;
        var rva = int.Parse(normalized, NumberStyles.AllowHexSpecifier, CultureInfo.InvariantCulture);
        var sections = pe.PEHeaders.SectionHeaders.Where(s => rva >= s.VirtualAddress &&
            (long)rva < (long)s.VirtualAddress + s.SizeOfRawData).ToArray();
        if (sections.Length != 1)
            throw new InvalidDataException("Candidate must resolve to one file-backed PE section");
        var section = sections[0];
        if (!section.SectionCharacteristics.HasFlag(SectionCharacteristics.MemExecute))
            throw new InvalidDataException("Candidate is outside executable code");
        var count = Math.Min(24, section.SizeOfRawData - (rva - section.VirtualAddress));
        var bytes = pe.GetSectionData(rva).GetContent(0, count).AsSpan();
        uint? start = null, end = null;
        for (var offset = 0; offset < unwind.Length; offset += 12)
        {
            var begin = BinaryPrimitives.ReadUInt32LittleEndian(unwind[offset..]);
            var limit = BinaryPrimitives.ReadUInt32LittleEndian(unwind[(offset + 4)..]);
            if ((uint)rva >= begin && (uint)rva < limit)
            {
                if (start.HasValue)
                    throw new InvalidDataException("Ambiguous unwind ownership");
                start = begin;
                end = limit;
            }
        }
        rows.Add(new { rva = $"0x{rva:x}", section = section.Name,
            bytes = Convert.ToHexString(bytes).ToLowerInvariant(),
            unwind_start = start.HasValue ? $"0x{start:x}" : null,
            unwind_end = end.HasValue ? $"0x{end:x}" : null,
            matches_function_start = start == (uint)rva });
    }
    Console.WriteLine(JsonSerializer.Serialize(new { mode = "offline_read_only", executable_sha256 = hash,
        build = 180383, runtime_verified = false, candidates = rows,
        caveat = "PE bounds and bytes are independent evidence only; leaf/split functions and native ABI require separate analysis." },
        new JsonSerializerOptions { WriteIndented = true }));
}
catch (Exception error) when (error is ArgumentException or IOException or InvalidDataException or FormatException or OverflowException or BadImageFormatException)
{
    Console.Error.WriteLine(error.Message);
    Environment.ExitCode = 1;
}
