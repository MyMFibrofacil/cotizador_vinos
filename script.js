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

const Precio_Logo = 0.3540 * 1.1; // Precio base por mm² del logo

function actualizarOpcionesCajas(index) {
    const tipoMaterial = document.getElementById(`tipoMaterial-${index}`).value;
    const tipoCaja = document.getElementById(`tipoCaja-${index}`);
    tipoCaja.innerHTML = '<option value="" disabled selected>Selecciona un tipo de caja</option>';
    if (opcionesCajas[tipoMaterial]) {
        opcionesCajas[tipoMaterial].forEach(opcion => {
            tipoCaja.appendChild(new Option(opcion.label, opcion.value));
        });
    }
}

function toggleLogoFields(index) {
    const conLogo = document.getElementById(`conLogo-${index}`).value;
    document.getElementById(`logoFields-${index}`).style.display = conLogo === 'si' ? 'block' : 'none';
}

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
    const cantidadTotalLogos = medidas.reduce((total, medida) => total + logosAgrupados[medida].cantidad, 0);
    let mensaje = '';

    if (medidas.length === 1) {
        const siguienteEscala = escalas.find(escala => cantidadTotalLogos < escala.limite);
        if (siguienteEscala) {
            mensaje = `Si pides más de ${cantidadTotalLogos} logos, obtendrás un mejor precio.`;
        }
    } else {
        mensaje = 'Unifica todas las medidas para obtener un mejor precio.';
    }

    document.getElementById('sugerenciaEscalas').innerHTML = `<p>${mensaje}</p>`;
}

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
            alert(`Completa todos los campos en la pestaña Medida ${i}`);
            return;
        }

        const preciosBase = {
            simple: 3927,
            simple_calada: 4485,
            doble: 6830,
            triple: 9280,
            cuadruple: 11590,
            sextuple: 17383,
            gin: 8640,
            magnum_x3L: 9350,
            magnum: 6485
        };
        const precioCajaUnitario = preciosBase[tipoCaja] || 0;
        const precioCajaTotal = precioCajaUnitario * cantidad * (cantidad > 50 ? 0.9 : 1);
        totalCajas += precioCajaTotal;

        if (conLogo) {
            const altoLogo = parseFloat(document.getElementById(`altoLogo-${i}`).value);
            const anchoLogo = parseFloat(document.getElementById(`anchoLogo-${i}`).value);
            const areaLogo = Math.max(altoLogo * anchoLogo, 2700);
            const medidaLogo = `${altoLogo}x${anchoLogo}`;
            if (!logosAgrupados[medidaLogo]) logosAgrupados[medidaLogo] = { areaLogo, cantidad: 0 };
            logosAgrupados[medidaLogo].cantidad += cantidad;
        }

        detallePrecios += `
            <tr>
                <td>${tipoCaja.replace('_', ' ')}</td>
                <td>${tipoMaterial.replace('_', ' ')}</td>
                <td>${cantidad}</td>
                <td>$${precioCajaUnitario.toLocaleString()}</td>
                <td>$${precioCajaTotal.toLocaleString()}</td>
            </tr>`;
    }

    for (const medida in logosAgrupados) {
        const { areaLogo, cantidad } = logosAgrupados[medida];
        const costoLogoUnitario = areaLogo * Precio_Logo * (cantidad > 10 ? 0.95 : 1);
        const totalLogoMedida = costoLogoUnitario * cantidad;
        totalLogos += totalLogoMedida;

        detallePrecios += `
            <tr>
                <td>Logos ${medida}</td>
                <td>N/A</td>
                <td>${cantidad}</td>
                <td>$${costoLogoUnitario.toLocaleString()}</td>
                <td>$${totalLogoMedida.toLocaleString()}</td>
            </tr>`;
    }

    const precioTotal = totalCajas + totalLogos;

    document.getElementById('resultadoFinal').innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Concepto</th>
                    <th>Material</th>
                    <th>Cantidad</th>
                    <th>Unitario</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>${detallePrecios}</tbody>
            <tfoot>
                <tr>
                    <td colspan="4">Total</td>
                    <td class="total-cell">$${precioTotal.toLocaleString()} +IVA</td>
                </tr>
            </tfoot>
        </table>`;
    document.getElementById('exportarPDF').style.display = 'block';
    generarSugerenciasPrecios(logosAgrupados);
}

function generarPestanas(cantidad) {
    const contenedorPestanas = document.getElementById('contenedorPestanas');
    contenedorPestanas.innerHTML = '';

    for (let i = 1; i <= cantidad; i++) {
        const pestana = `
            <div>
                <form>
                    <label>Material:</label>
                    <select id="tipoMaterial-${i}" onchange="actualizarOpcionesCajas(${i})">
                        <option value="" disabled selected>Selecciona</option>
                        <option value="acrilico">Acrílico</option>
                        <option value="enchapado_pino">Enchapado de Pino</option>
                    </select>
                    <label>Caja:</label>
                    <select id="tipoCaja-${i}"></select>
                    <label>Cantidad:</label>
                    <input id="cantidad-${i}" type="number">
                    <label>Logo:</label>
                    <select id="conLogo-${i}" onchange="toggleLogoFields(${i})">
                        <option value="no">No</option>
                        <option value="si">Sí</option>
                    </select>
                    <div id="logoFields-${i}" style="display:none;">
                        <label>Alto:</label>
                        <input id="altoLogo-${i}" type="number">
                        <label>Ancho:</label>
                        <input id="anchoLogo-${i}" type="number">
                    </div>
                </form>
            </div>`;
        contenedorPestanas.innerHTML += pestana;
    }

    contenedorPestanas.innerHTML += `
        <button onclick="calcularPrecioTotal(${cantidad})">Calcular Precio</button>
        <button id="exportarPDF" style="display:none;" onclick="exportarPDF()">Exportar PDF</button>`;
}

function exportarPDF() {
    const doc = new jspdf.jsPDF();
    const tabla = document.querySelector('#resultadoFinal table');
    doc.autoTable({ html: tabla });
    doc.save('Cotizacion.pdf');
}
