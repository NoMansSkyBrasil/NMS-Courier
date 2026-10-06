// Recover the originally imported executable bytes from an existing project.
// The caller must compare the printed SHA-256 with the expected fingerprint.
// @category NMSCourier.Research
import ghidra.app.script.GhidraScript;
import ghidra.program.database.mem.FileBytes;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;

public class ExportOriginalExecutable extends GhidraScript {
    public void run() throws Exception {
        String[] args = getScriptArgs();
        Path output = Path.of(args[0]);
        String expected = args[1].toLowerCase();
        List<FileBytes> all = currentProgram.getMemory().getAllFileBytes();
        if (all.size() != 1) throw new IllegalStateException("Expected one stored file, found " + all.size());
        FileBytes stored = all.get(0);
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] buffer = new byte[1 << 20];
        Files.createDirectories(output.getParent());
        // CREATE_NEW refuses to overwrite an existing file.
        try (OutputStream stream = Files.newOutputStream(output, StandardOpenOption.CREATE_NEW)) {
            for (long offset = 0; offset < stored.getSize(); ) {
                int count = stored.getOriginalBytes(offset, buffer);
                if (count <= 0) throw new IllegalStateException("Short read at " + offset);
                digest.update(buffer, 0, count);
                stream.write(buffer, 0, count);
                offset += count;
            }
        }
        String actual = HexFormat.of().formatHex(digest.digest());
        println("stored_name=" + stored.getFilename() + " size=" + stored.getSize() + " sha256=" + actual);
        if (!actual.equals(expected)) {
            Files.delete(output);
            throw new IllegalStateException("Fingerprint mismatch; output removed");
        }
    }
}
