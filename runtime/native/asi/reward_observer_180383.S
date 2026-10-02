// Preserve arguments, flags and registers; no call or game-object dereference.
    .text
    .globl courier_observe_reward_arguments
    .def courier_observe_reward_arguments; .scl 2; .type 32; .endef
    .seh_proc courier_observe_reward_arguments
courier_observe_reward_arguments:
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
    lock xaddl %eax, courier_reward_trace_next_180383(%rip)
    cmpl $512, %eax
    jae .Lreward_forward
    shlq $7, %rax
    leaq courier_reward_trace_180383(%rip), %r10
    addq %rax, %r10
    movq 32(%rsp), %r11
    movq %r11, 0(%r10)
    movq %rcx, 8(%r10)
    movq %rdx, 16(%r10)
    movq %r8, 24(%r10)
    movq %r9, 32(%r10)
    movq 72(%rsp), %r11
    movq %r11, 40(%r10)
    movq 80(%rsp), %r11
    movq %r11, 48(%r10)
    movq 88(%rsp), %r11
    movq %r11, 56(%r10)
    movq 96(%rsp), %r11
    movq %r11, 64(%r10)
    movq 104(%rsp), %r11
    movq %r11, 72(%r10)
    movq 112(%rsp), %r11
    movq %r11, 80(%r10)
    // Immutable records are published after all payload stores on x64.
    movl $1, 88(%r10)
.Lreward_forward:
    popq %r11
    popq %r10
    popq %rax
    popfq
    jmp *courier_original_reward_dispatch_180383(%rip)
    .seh_endproc
