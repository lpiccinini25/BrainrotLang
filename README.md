<img width="804" height="808" alt="image" src="https://github.com/user-attachments/assets/393189d1-ebc1-4308-87ca-55d54ecf258d" />

## The Story of Brainrot
Brainrot was born when we all came to the realization that why should amazing brainrot terminology only be limited to casual conversations with friends. Why not allow people to use fun and wacky brainrot terms while doing serious work as well! Brainrot is a robust, modular, and modern programming language designed for letting brainrotters around the world to both be silly and productive at the same time!

## The Team
Aristotle Kaporis, Daniel Ruskin, Luca Piccinini

## Features

- **Type Inference**: Let Brainrot do the heavy lifting. Declare variables and the types are inferred automatically.
- **Recursive Functions**: Full support for recursive calls with early return patterns.
- **Data Structures**: Define custom `aura` (struct) types to organize your data.
- **Optional Types**: Handle nullability with `?` and the `mid` (null) keyword.
- **Complex Iteration**: Loop through ranges with `grind` or iterate over collections with ease.
- **Built-in Operators**: Standard arithmetic, bitwise, and logical operators, plus unique operators like `#` for length.
- **Optimized Generation**: The compiler includes a powerful optimizer to simplify your code before generating target JavaScript.


## Static Constraints of Brainrot

1. Declaration & Scope Constraints
* Unique Identifiers: Every identifier (variable, function, or aura) must be unique within its
    scope. You cannot declare lowkey x twice in the same block.
* Declaration Before Use: You cannot reference any variable, function, or aura before it has
    been declared.
* Recursive Scope: Function names are added to the scope before their body is analyzed,
    allowing them to call themselves recursively.
* Struct Scope: Struct names are registered before their fields are analyzed, allowing fields
    to have the type of the struct itself (self-referential structs).

2. Variable & Assignment Constraints
* Immutability: Variables declared with locked_in are read-only. Any attempt to reassign them
    or use the ++/-- operators on them will trigger an error.
* Assignment Compatibility: The type of the value being assigned must be compatible with the
    variable's type (e.g., you cannot assign a rizz to a sigma).
* Type Inference: Variables declared without an explicit type (using lowkey or locked_in) have
    their type permanently fixed to the type of their initial value.

3. Operator Constraints
* Arithmetic Requirements: Operators like +, -, fanum_tax (*), mog (/), %, and ** require both
    operands to be numeric (sigma, int, or float).
* String Concatenation: The + operator is overloaded; if either operand is a string, the other
    can be any type, and the result is a string.
* Bitwise Integrity: Operators like &, |, ^, <<, and >> strictly require integer operands.
* Logical Purity: &&, ||, and ! strictly require rizz (boolean) operands.
* Comparison Consistency: 
    * Ordering operators (<, <=, >, >=) require numeric operands.
    * Equality operators (==, !=) require the two operands to have compatible types (you can't
        compare a string to a rizz).
* Length Operator: The # operator is only allowed on ArrayType or StringType.

4. Control Flow Constraints
* Boolean Test Conditions: The test expressions for vibe_check (if), go_go_go (while), and the
    ternary operator (? :) must result in a rizz (boolean).
* Iteration bounds:
    * run_it_back requires a numeric count.
    * grind i with low...high requires both low and high to be numeric.
* Collection Iteration: grind x with collection requires the collection to be an ArrayType.

5. Function & Call Constraints
* Callability: You can only use parentheses () to call an identifier that is actually a
    function (a cook).
* Strict Arity: A function call must provide exactly the same number of arguments as there are
    parameters in the function's declaration.
* Parameter Type Match: Each argument in a function call must have a type compatible with the
    corresponding parameter in the function signature.
* Return Type Integrity:
    * it_gave <exp>: The type of <exp> must be compatible with the function's declared return
        type.
    * it_gave (short return): This is only allowed if the function's return type is void.

6. Struct (aura) & Data Constraints
* Instantiation Arity: When using spawn, you must provide an argument for every field defined
    in the aura.
* Field Type Compatibility: Every argument passed to spawn must match the type of the
    corresponding field in the aura definition.
* Member Existence: You can only access fields (using . or ?.) that are explicitly defined in
    the aura's declaration.
* Not a Struct Error: You cannot use member access (.) on primitive types like sigma or rizz.
* Subscripting: The [] operator can only be used on expressions of ArrayType.

7. Optional Type Constraints
* Null Coalescing Harmony: In opt ?? fallback, the fallback must have a type compatible with
    the base type of the optional opt.
* Optional Guarding: Accessing a field on an optional struct requires either optional chaining
    (?.) or unwrapping.
* Safe Promotion: An int is compatible with sigma, and an int is compatible with int?, but a
    sigma is not compatible with int.

## Generated Code Example

Brainrot generates clean, readable JavaScript.

**Input (Brainrot):**
```brainrot
lowkey x = 10;
grind i with 1...x {
  yap(i * 2);
}
```

**Output (JavaScript):**
```javascript
let x = 10;
for (let i = 1; i <= x; i++) {
  console.log(i * 2);
}
```

## Links

- **Grammar**: [src/brainrot.ohm](./src/brainrot.ohm)
- **This Repository**: [BrainrotLang](https://aristotle-dev.github.io/brainrot/)
- **Companion Site**: [Brainrot GH Pages Site](https://lucapiccinini.github.io/Brainrot/)
