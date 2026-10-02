// Export selected offline candidates without whole-program auto-analysis.
// @category NMSCourier.Research
import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.app.cmd.disassemble.DisassembleCommand;
import ghidra.program.model.address.Address;
import ghidra.program.model.listing.Function;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;

public class ExportAcquisitionSeeds extends GhidraScript {
    public void run() throws Exception {
        String[] args = getScriptArgs();
        Path seeds = Path.of(args[0]);
        Path output = Path.of(args[1]);
        int timeout = args.length > 2 ? Integer.parseInt(args[2]) : 30;
        if (timeout < 1 || timeout > 120) throw new IllegalArgumentException("Timeout must be 1..120");
        Files.createDirectories(output);
        DecompInterface decompiler = new DecompInterface();
        decompiler.openProgram(currentProgram);
        StringBuilder manifest = new StringBuilder("rva\tpublic_candidate\tstatus\n");
        try {
            for (String row : Files.readAllLines(seeds)) {
                if (row.isBlank()) continue;
                String[] fields = row.split("\t", 2);
                Address address = currentProgram.getImageBase().add(Long.parseUnsignedLong(fields[0], 16));
                new DisassembleCommand(address, null, true).applyTo(currentProgram, monitor);
                Function function = getFunctionAt(address);
                if (function == null) function = createFunction(address, "candidate_" + fields[0]);
                if (function == null) {
                    manifest.append(fields[0]).append('\t').append(fields[1]).append("\tfunction_creation_failed\n");
                    continue;
                }
                DecompileResults result = decompiler.decompileFunction(function, timeout, monitor);
                String status = result.decompileCompleted() ? "decompiled" : "failed";
                if (result.decompileCompleted()) Files.writeString(output.resolve(fields[0] + ".c"),
                    "/* Offline candidate: " + fields[1] + ". Identity and ABI unverified. */\n" + result.getDecompiledFunction().getC(), StandardCharsets.UTF_8);
                else Files.writeString(output.resolve(fields[0] + ".error.txt"), result.getErrorMessage(), StandardCharsets.UTF_8);
                manifest.append(fields[0]).append('\t').append(fields[1]).append('\t').append(status).append('\n');
                Files.writeString(output.resolve("manifest.tsv"), manifest.toString(), StandardCharsets.UTF_8);
                println(fields[0] + " " + status);
            }
        } finally { decompiler.dispose(); }
    }
}
