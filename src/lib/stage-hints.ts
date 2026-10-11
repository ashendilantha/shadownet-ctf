import 'server-only';

export interface HintItem {
  id: number;
  hint_level: number;
  hint_text: string;
  point_penalty: number;
}

export const STAGE_HINTS: Record<number, HintItem[]> = {
  1: [
    { id: 101, hint_level: 1, hint_text: 'Inspect the HTML source comments and look for unscrubbed developer remarks containing internal deployment coordinates.', point_penalty: 40 },
    { id: 102, hint_level: 2, hint_text: 'Examine custom HTTP response headers returned by the server for exposed debugging keys and author metadata.', point_penalty: 40 },
  ],
  2: [
    { id: 201, hint_level: 1, hint_text: 'The whistleblower concealed an encrypted document inside the drone photo exhibit. Use the bunker emergency codeword "shelter" as the steganography extraction passphrase.', point_penalty: 40 },
    { id: 202, hint_level: 2, hint_text: 'Out of the 27 audio files, carrier channel 14 carries the authentic signal. Analyze its frequency spectrogram in an audio analysis tool to visually read the hidden flag.', point_penalty: 40 },
  ],
  3: [
    { id: 301, hint_level: 1, hint_text: 'The encryption oracle operates in Electronic Codebook (ECB) mode, meaning identical plaintext 16-byte blocks always produce identical ciphertext blocks.', point_penalty: 40 },
    { id: 302, hint_level: 2, hint_text: 'Supply crafted padding to push one secret character at a time into the last byte of a target block, allowing you to guess and recover the key byte-by-byte.', point_penalty: 40 },
  ],
  4: [
    { id: 401, hint_level: 1, hint_text: 'The login query uses string concatenation for the username parameter. Injecting quote characters breaks the SQL syntax and allows adding custom logic conditions.', point_penalty: 40 },
    { id: 402, hint_level: 2, hint_text: 'Use an OR condition that is always true combined with comment delimiters to bypass the password verification check and sign in as administrator.', point_penalty: 40 },
  ],
  5: [
    { id: 501, hint_level: 1, hint_text: 'The token generator generates numbers using a standard Linear Congruential Generator recurrence formula with fixed multiplier and increment constants.', point_penalty: 40 },
    { id: 502, hint_level: 2, hint_text: 'Collecting several consecutive numbers from the stream lets you solve a system of linear congruences to deduce the modulus, multiplier, and next output token.', point_penalty: 40 },
  ],
  6: [
    { id: 601, hint_level: 1, hint_text: 'Decompile the binary and locate the key validation function. Look at how user input is iterated over in a loop.', point_penalty: 40 },
    { id: 602, hint_level: 2, hint_text: 'The verification logic applies a symmetric bitwise XOR transformation to your input. Reversing the static reference array reveals the expected key.', point_penalty: 40 },
  ],
  7: [
    { id: 701, hint_level: 1, hint_text: 'Search for executables owned by root that have the setuid permission bit enabled across the local filesystem.', point_penalty: 40 },
    { id: 702, hint_level: 2, hint_text: 'Inspect the strings and system calls in the custom backup binary to check if it calls sub-utilities without full absolute paths, enabling PATH environment hijacking.', point_penalty: 40 },
  ],
  8: [
    { id: 801, hint_level: 1, hint_text: 'The entry web portal accepts URL inputs that can be manipulated to make internal HTTP requests to the local cloud link-local metadata address.', point_penalty: 40 },
    { id: 802, hint_level: 2, hint_text: 'Extract the database connection credentials from the metadata endpoint, then use network pivoting or port forwarding to authenticate to the isolated internal MySQL server.', point_penalty: 40 },
  ],
};