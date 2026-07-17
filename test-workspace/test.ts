function miFuncionMuyLarga(a: number, b: number) {
    console.log("Iniciando evaluación...");

    if (a > 0) {
        if (b > 0) {
            if (a === b) {
                console.log("Son iguales y positivos");
            } else if (a > b) {
                if (a > 100) {
                    console.log("A es gigantesco");
                }
            } else {
                if (b > 100) {
                    console.log("B es gigantesco");
                }
            }
        } else {
            if (b === 0) {
                console.log("B es cero");
            } else {
                if (a + b < 0) {
                    console.log("La suma es negativa");
                }
            }
        }
    } else {
        if (a === 0) {
            if (b === 0) {
                console.log("Ambos son cero, caso base");
            }
        } else {
            for (let i = 0; i < Math.abs(a); i++) {
                if (i % 2 === 0) {
                    console.log("Iteración par");
                } else {
                    console.log("Iteración impar");
                }
            }
        }
    }

    if (a > 0) {
        if (b > 0) {
            if (a === b) {
                console.log("Son iguales y positivos");
            } else if (a > b) {
                if (a > 100) {
                    console.log("A es gigantesco");
                }
            } else {
                if (b > 100) {
                    console.log("B es gigantesco");
                }
            }
        } else {
            if (b === 0) {
                console.log("B es cero");
            } else {
                if (a + b < 0) {
                    console.log("La suma es negativa");
                }
            }
        }
    } else {
        if (a === 0) {
            if (b === 0) {
                console.log("Ambos son cero, caso base");
            }
        } else {
            for (let i = 0; i < Math.abs(a); i++) {
                if (i % 2 === 0) {
                    console.log("Iteración par");
                } else {
                    console.log("Iteración impar");
                }
            }
        }
    }
}
