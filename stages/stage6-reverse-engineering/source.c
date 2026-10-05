#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define FLAG_LEN 42

static const unsigned char EXPECTED_DATA[FLAG_LEN] = {
    0x09, 0x16, 0x23, 0x2a, 0x2d, 0x43, 0x28, 0x2a, 0x27, 0x10,
    0x50, 0x17, 0x4f, 0xeb, 0xb4, 0xf1, 0xe6, 0xd5, 0xa7, 0x02,
    0xf7, 0xa8, 0xf3, 0xae, 0x94, 0xdb, 0x9e, 0xcb, 0xc9, 0xef,
    0x87, 0x85, 0xe9, 0xe3, 0xf6, 0xf3, 0xab, 0x98, 0xf8, 0xa8,
    0xbf, 0xae
};

int check_access(const char *input) {
    if (strlen(input) != FLAG_LEN) {
        printf("Access denied!\n");
        return 0;
    }

    for (int i = 0; i < FLAG_LEN; i++) {
        unsigned char key = (0x5A + (i * 3)) & 0xFF;
        unsigned char transformed = (((unsigned char)input[i] ^ key) + (i % 7)) & 0xFF;
        if (transformed != EXPECTED_DATA[i]) {
            printf("Access denied!\n");
            return 0;
        }
    }

    printf("Access granted!\n");
    printf("Flag: %s\n", input);
    return 1;
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Usage: %s <access_code>\n", argv[0]);
        return 1;
    }

    check_access(argv[1]);
    return 0;
}