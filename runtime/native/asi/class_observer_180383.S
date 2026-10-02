// Preserve every argument, register, stack argument and original return value.
// Scratch registers and flags are saved; all writes target DLL-owned storage.
    .text
    .globl courier_observe_class_argument
    .def courier_observe_class_argument; .scl 2; .type 32; .endef
    .seh_proc courier_observe_class_argument
courier_observe_class_argument:
    pushfq
    .seh_stackalloc 8
    pushq %rax
    .seh_pushreg %rax
    pushq %r10
    .seh_pushreg %r10
    pushq %r11
    .seh_pushreg %r11
    .seh_endprologue
    movl $1, %eax
    lock xaddl %eax, courier_class_trace_next_180383(%rip)
    cmpl $2048, %eax
    jae .Lcount
    shlq $5, %rax
    leaq courier_class_trace_180383(%rip), %r10
    addq %rax, %r10
    movq 32(%rsp), %r11
    movq %r11, (%r10)
    movl %r9d, 8(%r10)
    // x86 stores publish in order; the reader uses an interlocked acquire.
    movl $1, 16(%r10)
.Lcount:
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
    popq %r11
    popq %r10
    popq %rax
    popfq
    jmp *courier_original_class_generator_180383(%rip)
    .seh_endproc
