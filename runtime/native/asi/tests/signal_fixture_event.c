#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdio.h>

int main(int argc, char **argv) {
    if (argc != 2) return 2;
    HANDLE event = OpenEventA(EVENT_MODIFY_STATE, FALSE, argv[1]);
    if (!event) {
        printf("open_error=%lu\n", (unsigned long)GetLastError());
        return 3;
    }
    BOOL signaled = SetEvent(event);
    CloseHandle(event);
    if (!signaled) return 4;
    puts("event_signaled");
    return 0;
}
