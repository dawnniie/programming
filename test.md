JMP 5
* $1: static input location
* $2: static SDA value
* $3: variable input length
LDA $2
ADD $1
STA 
INP 0			-- TAKE INPUT
JEQ				-- next step if input done
JMP 14
* $4: temporary input storage
* $5: temporary length counter
* $6: static 0 value
STA $4
LDA $3
ADDS 4
STA $3
LDA $6
STA $5
LDA $4
SHR 24
JEQ				--







- pull input into 32 bit chunks at the end
- add 1, pad, add length int
< variable hash values >
< static round constants >
- iterate over len + 511 / 512
  - < variable message schedule data >
  - copy data from storage
  - iterate over 16 -> 63: do required computations
  - < variable copy hash values to a -> h >
  - iterate over 0 -> 63: do compression
  - add a -> h to hash values respectively
- print out hash values

< extendable input data >