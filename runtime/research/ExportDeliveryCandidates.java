// Export bounded offline decompiler candidates linked to delivery-related strings.
// @category NMSCourier.Research

import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.program.model.address.Address;
import ghidra.program.model.listing.Data;
import ghidra.program.model.listing.DataIterator;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionIterator;
import ghidra.program.model.symbol.Reference;
import ghidra.program.model.symbol.ReferenceIterator;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.io.BufferedWriter;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

public class ExportDeliveryCandidates extends GhidraScript {
    private final Pattern keywords = Pattern.compile(
        "Freighter|GcReward|InventoryClass|ShipLayout|ClassProbabilities|Quicksilver|Nanite",
        Pattern.CASE_INSENSITIVE);

    private String rva(Address address) {
        return "0x" + Long.toHexString(address.subtract(currentProgram.getImageBase()));
    }

    private void addCandidate(Map<Function, Set<String>> candidates, Address source, String term) {
        Function function = currentProgram.getFunctionManager().getFunctionContaining(source);
        if (function != null) {
            candidates.computeIfAbsent(function, ignored -> new LinkedHashSet<>()).add(term);
            return;
        }
        // A string may be referenced through a data-pointer table rather than directly from code.
        ReferenceIterator indirect = currentProgram.getReferenceManager().getReferencesTo(source);
        int visited = 0;
        while (indirect.hasNext() && visited++ < 64) {
            Reference reference = indirect.next();
            Function owner = currentProgram.getFunctionManager().getFunctionContaining(reference.getFromAddress());
            if (owner != null) {
                candidates.computeIfAbsent(owner, ignored -> new LinkedHashSet<>()).add(term);
            }
        }
    }

    @Override
    public void run() throws Exception {
        String[] arguments = getScriptArgs();
        if (arguments.length < 1) throw new IllegalArgumentException("Output directory is required");
        Path output = Path.of(arguments[0]).toAbsolutePath();
        int limit = arguments.length > 1 ? Integer.parseInt(arguments[1]) : 400;
        if (limit < 1 || limit > 2000) throw new IllegalArgumentException("Limit must be 1..2000");
        Files.createDirectories(output.resolve("functions"));
        Map<Function, Set<String>> candidates = new LinkedHashMap<>();
        try (BufferedWriter strings = Files.newBufferedWriter(output.resolve("string-references.tsv"), StandardCharsets.UTF_8)) {
            strings.write("string_rva\treference_rva\ttext\n");
            DataIterator data = currentProgram.getListing().getDefinedData(true);
            while (data.hasNext() && !monitor.isCancelled()) {
                Data value = data.next();
                if (!(value.getValue() instanceof String)) continue;
                String term = (String)value.getValue();
                if (!keywords.matcher(term).find()) continue;
                ReferenceIterator references = currentProgram.getReferenceManager().getReferencesTo(value.getAddress());
                while (references.hasNext()) {
                    Reference reference = references.next();
                    strings.write(rva(value.getAddress()) + "\t" + rva(reference.getFromAddress()) + "\t" + term.replace('\n', ' ').replace('\t', ' ') + "\n");
                    addCandidate(candidates, reference.getFromAddress(), term);
                }
            }
        }
        try (BufferedWriter functions = Files.newBufferedWriter(output.resolve("function-index.tsv"), StandardCharsets.UTF_8)) {
            functions.write("rva\tname\taddress_count\n");
            FunctionIterator iterator = currentProgram.getFunctionManager().getFunctions(true);
            while (iterator.hasNext()) {
                Function function = iterator.next();
                functions.write(rva(function.getEntryPoint()) + "\t" + function.getName() + "\t" + function.getBody().getNumAddresses() + "\n");
            }
        }
        DecompInterface decompiler = new DecompInterface();
        int attempted = 0;
        int succeeded = 0;
        try (BufferedWriter manifest = Files.newBufferedWriter(output.resolve("candidates.tsv"), StandardCharsets.UTF_8)) {
            manifest.write("rva\tname\tstatus\tterms\n");
            decompiler.openProgram(currentProgram);
            for (Map.Entry<Function, Set<String>> candidate : candidates.entrySet()) {
                if (attempted++ >= limit || monitor.isCancelled()) break;
                Function function = candidate.getKey();
                DecompileResults result = decompiler.decompileFunction(function, 30, monitor);
                String status = result.decompileCompleted() ? "decompiled" : "failed";
                if (result.decompileCompleted()) {
                    String filename = Long.toHexString(function.getEntryPoint().subtract(currentProgram.getImageBase())) + ".c";
                    Files.writeString(output.resolve("functions").resolve(filename),
                        "/* Offline pseudocode candidate. Identity and runtime safety are unverified. */\n" +
                        result.getDecompiledFunction().getC(), StandardCharsets.UTF_8);
                    succeeded++;
                }
                manifest.write(rva(function.getEntryPoint()) + "\t" + function.getName() + "\t" + status + "\t" + String.join(" | ", candidate.getValue()).replace('\t', ' ').replace('\n', ' ') + "\n");
                manifest.flush();
            }
        } finally {
            decompiler.dispose();
        }
        println("delivery_candidates=" + candidates.size() + " attempted=" + Math.min(attempted, limit) + " decompiled=" + succeeded);
    }
}
