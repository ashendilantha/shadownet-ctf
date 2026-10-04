#include <stdio.h>
#include <string.h>
#include <stdlib.h>

const char SECRET_FLAG[] = "SHADOWNET{5h4d0wn_3ng1n33r1ng_15_c00l_9kh}";

int check_access(const char *input) {
    if (strcmp(input, SECRET_FLAG) == 0) {
        printf("Access granted!\n");
        printf("Flag: %s\n", SECRET_FLAG);
        return 1;
    }
    printf("Access denied!\n");
    return 0;
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Usage: %s <access_code>\n", argv[0]);
        printf("Example: %s SHADOWNET{Hithana de wenne na... Wena de hitha ganna ba}\n", argv[0]);
        return 1;
    }

    check_access(argv[1]);
    return 0;
}