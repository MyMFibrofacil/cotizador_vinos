// Opciones de cajas según el material
const opcionesCajas = {
    acrilico: [
        { value: 'simple', label: 'Simple' },
        { value: 'doble', label: 'Doble' }
    ],
    enchapado_pino: [
        { value: 'simple', label: 'Simple' },
        { value: 'simple_calada', label: 'Simple Calada' },
        { value: 'doble', label: 'Doble' },
        { value: 'triple', label: 'Triple' },
        { value: 'cuadruple', label: 'Cuádruple' },
        { value: 'sextuple', label: 'Séxtuple' },
        { value: 'gin', label: 'Gin' },
        { value: 'magnum_x3L', label: 'Magnum x3L' },
        { value: 'magnum', label: 'Magnum' }
    ]
};

// Define el precio base por mm² del logo
const Precio_Logo = 0.3540 * 1.1

// Los precios de las cajas se definen en la linea de codigo 131, buscar Ctrl + F = precioCajaUnitario y lo encontras para cambiar

// Función para actualizar las opciones del tipo de caja según el tipo de material
function actualizarOpcionesCajas(index) {
    const tipoMaterial = document.getElementById(`tipoMaterial-${index}`).value;
    const tipoCaja = document.getElementById(`tipoCaja-${index}`);

    // Limpiar opciones actuales
    tipoCaja.innerHTML = '<option value="" disabled selected>Selecciona un tipo de caja</option>';

    // Agregar las nuevas opciones según el material
    if (opcionesCajas[tipoMaterial]) {
        opcionesCajas[tipoMaterial].forEach(opcion => {
            const nuevaOpcion = document.createElement('option');
            nuevaOpcion.value = opcion.value;
            nuevaOpcion.textContent = opcion.label;
            tipoCaja.appendChild(nuevaOpcion);
        });
    }
}

// Función para mostrar u ocultar los campos de medidas del logo
function toggleLogoFields(index) {
    const conLogo = document.getElementById(`conLogo-${index}`).value;
    const logoFields = document.getElementById(`logoFields-${index}`);
    logoFields.style.display = conLogo === 'si' ? 'block' : 'none';
}

// Agregar sugerencias para la siguiente escala de precios
function generarSugerenciasPrecios(logosAgrupados) {
    const escalas = [
        { limite: 1, factor: 1.6 },
        { limite: 10, factor: 1.3 },
        { limite: 20, factor: 1.05 },
        { limite: 50, factor: 1 },
        { limite: 100, factor: 0.95 },
        { limite: 500, factor: 0.9 },
        { limite: 1000, factor: 0.85 },
        { limite: Infinity, factor: 0.8 }
    ];

    const medidas = Object.keys(logosAgrupados);

    // Sumar todas las cantidades agrupadas para calcular la escala total
    const cantidadTotalLogos = medidas.reduce((total, medida) => total + logosAgrupados[medida].cantidad, 0);

    let mensaje = '';

    if (medidas.length === 1) {
        // Si todas las medidas son iguales, sumar las cantidades y calcular la escala
        for (let i = 0; i < escalas.length; i++) {
            if (cantidadTotalLogos <= escalas[i].limite) {
                // Avanzar al siguiente nivel de escala
                const siguienteEscala = escalas[i + 1]; // Cambio aquí
                if (siguienteEscala) {
                    const nuevaCantidad = escalas.limite + 1; // Cantidad mínima para la siguiente escala
                    const nuevoPrecioLogoUnitario = (logosAgrupados[medidas[0]].areaLogo * Precio_Logo) * siguienteEscala.factor; // Corrección aquí
                    const nuevoPrecioTotal = nuevoPrecioLogoUnitario * nuevaCantidad;

                    mensaje = `
                        Si pides más de ${escalas[i].limite} logos, 
                        el precio por logo será de 
                        <strong>$${nuevoPrecioLogoUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong> 
                        `;
                }
                break;
            }
        }
    } else {
        // Si hay medidas distintas, sugerir igualar medidas para mejor precio
        mensaje = `
            Tienes logos con diferentes medidas. 
            Si unificas todas las medidas a <strong>${medidas[0]}</strong>, podrías obtener un mejor precio.
        `;
    }

    if (!mensaje) {
        mensaje = 'Has alcanzado la escala más baja de precios.';
    }

    // Mostrar el mensaje en el contenedor
    document.getElementById('sugerenciaEscalas').innerHTML = `
        <p style="font-size: 14px; color: #555; margin-top: 10px;">
            ${mensaje}
        </p>
    `;
}


// Actualización de la función calcularPrecioTotal para incluir la sugerencia
function calcularPrecioTotal(cantidadPestanas) {
    let totalCajas = 0;
    let totalLogos = 0;
    let detallePrecios = '';
    const logosAgrupados = {};

    for (let i = 1; i <= cantidadPestanas; i++) {
        const tipoMaterial = document.getElementById(`tipoMaterial-${i}`).value;
        const tipoCaja = document.getElementById(`tipoCaja-${i}`).value;
        const cantidad = parseInt(document.getElementById(`cantidad-${i}`).value);
        const conLogo = document.getElementById(`conLogo-${i}`).value === 'si';

        if (!tipoMaterial || !tipoCaja || !cantidad || (conLogo && (!document.getElementById(`altoLogo-${i}`).value || !document.getElementById(`anchoLogo-${i}`).value))) {
            alert('Por favor, completa todos los campos en la pestaña Medida ' + i);
            return;
        }

        // Precios base de las cajas
        let precioCajaUnitario = 0;
        switch (tipoCaja) {
            case 'simple': precioCajaUnitario = 3927; break;
            case 'simple_calada': precioCajaUnitario = 4485; break;
            case 'doble': precioCajaUnitario = 6830; break;
            case 'triple': precioCajaUnitario = 9280; break;
            case 'cuadruple': precioCajaUnitario = 11590; break;
            case 'sextuple': precioCajaUnitario = 17383; break;
            case 'gin': precioCajaUnitario = 8640; break;
            case 'magnum_x3L': precioCajaUnitario = 9350; break;
            case 'magnum': precioCajaUnitario = 6485; break;
            default:
                alert('El tipo de caja seleccionado no es válido en la pestaña Medida ' + i);
                return;
        }

        let precioCajaTotal = precioCajaUnitario * cantidad;
        if (cantidad > 50) {
            precioCajaTotal *= 0.9; // 10% de descuento
        }
        totalCajas += precioCajaTotal;

        // Manejo de los logos
        if (conLogo) {
            const altoLogo = parseFloat(document.getElementById(`altoLogo-${i}`).value);
            const anchoLogo = parseFloat(document.getElementById(`anchoLogo-${i}`).value);
            const areaLogo = Math.max(altoLogo * anchoLogo, 2700);
            const medidaLogo = `${altoLogo}x${anchoLogo}`;

            if (!logosAgrupados[medidaLogo]) {
                logosAgrupados[medidaLogo] = { areaLogo, cantidad: 0 };
            }
            logosAgrupados[medidaLogo].cantidad += cantidad;
        }

        // Agregar detalle de precios para cajas
        detallePrecios += `
        <tr>
            <td style="text-align: center;">Caja ${tipoCaja.charAt(0).toUpperCase() + tipoCaja.slice(1).replace('_', ' ')}</td>
            <td style="text-align: center;">${tipoMaterial.charAt(0).toUpperCase() + tipoMaterial.slice(1).replace('_', ' ')}</td>
            <td style="text-align: center;">${cantidad}</td>
            <td style="text-align: center;">$${precioCajaUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right;">$${precioCajaTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
        </tr>
        `;
        
    
    }

    // Calcular precios de los logos agrupados
    for (const medida in logosAgrupados) {
        const { areaLogo, cantidad } = logosAgrupados[medida];
        let precioLogoBase = areaLogo * Precio_Logo; // Precio del área base (mínimo 2700mm²)
    
        // Determinar el factor de escala según la cantidad agrupada
        let factorEscala = 1;
        if (cantidad === 1) {
            factorEscala = 1.6;
        } else if (cantidad >= 2 && cantidad <= 10) {
            factorEscala = 1.3;
        } else if (cantidad >= 11 && cantidad <= 20) {
            factorEscala = 1.05;
        } else if (cantidad >= 21 && cantidad <= 50) {
            factorEscala = 1;
        } else if (cantidad >= 51 && cantidad <= 100) {
            factorEscala = 0.95;
        } else if (cantidad >= 101 && cantidad <= 500) {
            factorEscala = 0.9;
        } else if (cantidad >= 501 && cantidad <= 1000) {
            factorEscala = 0.85;
        } else if (cantidad > 1001) {
            factorEscala = 0.8;
        }
    
        // Cálculo final del precio unitario y total para esta medida
        const costoLogoUnitario = precioLogoBase * factorEscala;
        const totalLogoMedida = costoLogoUnitario * cantidad;
        totalLogos += totalLogoMedida;
    
        // Agregar los datos al desglose de precios
        detallePrecios += `
        <tr>
            <td style="text-align: center;">Logos ${medida}</td>
            <td style="text-align: center;">N/A</td>
            <td style="text-align: center;">${cantidad}</td>
            <td style="text-align: center;">$${costoLogoUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right;">$${totalLogoMedida.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
        </tr>
    `;
        
    }

    const precioTotal = totalCajas + totalLogos;

    // Mostrar el desglose de precios
    document.getElementById('resultadoFinal').innerHTML = ` 
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
            <tr style="border-bottom: 2px solid #000; font-weight: bold; text-align: center;">
                <th style="width: 25%; text-align: center;">Concepto</th>
                <th style="width: 20%; text-align: center;">Tipo de Tapa</th>
                <th style="width: 15%; text-align: center;">Cantidad</th>
                <th style="width: 20%; text-align: center;">Unitario</th>
                <th style="width: 20%; text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${detallePrecios}
        </tbody>
        <tfoot>
            <tr style="font-size: 18px; font-weight: bold; border-top: 2px solid #000;">
                <td colspan="4" style="text-align: right; padding-top: 10px;">Total</td>
                <td style="text-align: right; padding-top: 10px;">$${precioTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })} +IVA</td>
            </tr>
        </tfoot>
    </table>`;



    // Llamar a la función para generar sugerencias
    generarSugerenciasPrecios(logosAgrupados);
}

// Función para generar dinámicamente las pestañas según la cantidad seleccionada
function generarPestanas(cantidad) {
    const contenedorPestanas = document.getElementById('contenedorPestanas');
    contenedorPestanas.innerHTML = ''; // Limpia el contenedor

    for (let i = 1; i <= cantidad; i++) {
        const pestana = document.createElement('div');
        pestana.className = 'pestana';
        pestana.innerHTML = `
            <div style="padding: 10px; background-color: #f7f7f7; cursor: pointer;" onclick="togglePestana(${i})">
                <strong>Medida ${i}</strong>
            </div>
            <div id="contenido-${i}" style="display: none; padding: 10px;">
                <form>
                    <label for="tipoMaterial-${i}">Tipo de Material para la Tapa:</label>
                    <select id="tipoMaterial-${i}" required onchange="actualizarOpcionesCajas(${i})">
                        <option value="" disabled selected>Selecciona un material</option>
                        <option value="acrilico">Acrílico</option>
                        <option value="enchapado_pino">Enchapado de Pino</option>
                    </select>

                    <label for="tipoCaja-${i}">Tipo de Caja:</label>
                    <select id="tipoCaja-${i}" required>
                        <option value="" disabled selected>Selecciona un tipo de caja</option>
                    </select>

                    <label for="cantidad-${i}">Cantidad (unidades):</label>
                    <input type="number" id="cantidad-${i}" min="1" required placeholder="Introduce la cantidad">

                    <div>
                        <label for="conLogo-${i}">¿Deseas incluir logo?</label>
                        <select id="conLogo-${i}" onchange="toggleLogoFields(${i})">
                            <option value="no" selected>No</option>
                            <option value="si">Sí</option>
                        </select>
                    </div>

                    <div id="logoFields-${i}" style="display: none;">
                        <label for="altoLogo-${i}">Altura del Logo (mm):</label>
                        <input type="number" id="altoLogo-${i}" min="1" placeholder="Introduce la altura del logo">

                        <label for="anchoLogo-${i}">Ancho del Logo (mm):</label>
                        <input type="number" id="anchoLogo-${i}" min="1" placeholder="Introduce el ancho del logo">
                    </div>
                </form>
            </div>
        `;
        contenedorPestanas.appendChild(pestana);
    }

    // Agregar botón de calcular precio al final
    const botonCalcular = document.createElement('button');
    botonCalcular.textContent = 'Calcular Precio Total';
    botonCalcular.style.marginTop = '20px';
    botonCalcular.onclick = () => calcularPrecioTotal(cantidad);
    contenedorPestanas.appendChild(botonCalcular);

    // Contenedor para mostrar el resultado final
    const resultadoFinal = document.createElement('div');
    resultadoFinal.id = 'resultadoFinal';
    resultadoFinal.className = 'result';
    contenedorPestanas.appendChild(resultadoFinal);
}

// Función para alternar la visibilidad de las pestañas
function togglePestana(index) {
    const contenido = document.getElementById(`contenido-${index}`);
    contenido.style.display = contenido.style.display === 'none' ? 'block' : 'none';
}
