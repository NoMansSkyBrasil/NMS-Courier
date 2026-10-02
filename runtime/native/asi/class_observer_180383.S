// Preserve every argument, register, stack argument and original return value.
// Only flags are temporarily changed; counters belong to the observer DLL.
    .text
    .globl courier_observe_class_argument
    .def courier_observe_class_argument; .scl 2; .type 32; .endef
    .seh_proc courier_observe_class_argument
courier_observe_class_argument:
    pushfq
    .seh_stackalloc 8
    .seh_endprologue
    cmpl $0, %r9d
    je .Lclass0
    cmpl $1, %r9d
    je .Lclass1
    cmpl $2, %r9d
    je .Lclass2
    cmpl $3, %r9d
    je .Lclass3
    lock incl courier_class_counts_180383+16(%rip)
    jmp .Lforward
.Lclass0:
    lock incl courier_class_counts_180383(%rip)
    jmp .Lforward
.Lclass1:
    lock incl courier_class_counts_180383+4(%rip)
    jmp .Lforward
.Lclass2:
    lock incl courier_class_counts_180383+8(%rip)
    jmp .Lforward
.Lclass3:
    lock incl courier_class_counts_180383+12(%rip)
.Lforward:
    popfq
    jmp *courier_original_class_generator_180383(%rip)
    .seh_endproc
