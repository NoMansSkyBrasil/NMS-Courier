// Export bounded database references without whole-program analysis or game execution.
// @category NMSCourier.Research
import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.listing.Function;
import ghidra.program.model.symbol.ReferenceIterator;
import ghidra.program.model.symbol.Reference;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class ExportNativeDataReferences extends GhidraScript {
    public void run() throws Exception {
        String[] args = getScriptArgs();
        List<String> rows = Files.readAllLines(Path.of(args[0]));
        if (rows.size() < 1 || rows.size() > 16) throw new IllegalArgumentException("Expected 1..16 targets");
        Path output = Path.of(args[1]);
        Files.createDirectories(output);
        StringBuilder refs = new StringBuilder("target_rva\tsource_rva\treference_type\tfunction_rva\n");
        StringBuilder manifest = new StringBuilder("rva\tpublic_candidate\tstatus\n");
        for (String row : rows) {
            String[] fields = row.split("\t", 2);
            Address target = currentProgram.getImageBase().add(Long.parseUnsignedLong(fields[0], 16));
            ReferenceIterator iterator = currentProgram.getReferenceManager().getReferencesTo(target);
            int count = 0;
            while (iterator.hasNext()) {
                if (++count > 128) throw new IllegalArgumentException("Reference budget exceeded");
                Reference ref = iterator.next();
                Function owner = getFunctionContaining(ref.getFromAddress());
                refs.append(fields[0]).append('\t')
                    .append(Long.toHexString(ref.getFromAddress().subtract(currentProgram.getImageBase())))
                    .append('\t').append(ref.getReferenceType()).append('\t')
                    .append(owner == null ? "unknown" : Long.toHexString(owner.getEntryPoint().subtract(currentProgram.getImageBase())))
                    .append('\n');
            }
            manifest.append(fields[0]).append('\t').append(fields[1]).append("\tdata_references_only\n");
            println(fields[0] + " references=" + count);
        }
        Files.writeString(output.resolve("references.tsv"), refs.toString(), StandardCharsets.UTF_8);
        Files.writeString(output.resolve("manifest.tsv"), manifest.toString(), StandardCharsets.UTF_8);
    }
}
