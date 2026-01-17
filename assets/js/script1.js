let isLogin = true;
// verifica si hay sesion abierta post a cierre de sesion
const userKey = sessionStorage.getItem('active_user');
const paginaActual = window.location.pathname;
// Si no hay usuario y no estamos en el login (index), mandar al login
if (!userKey && !paginaActual.includes("index.html")) {
    window.location.href = 'index.html';
}

// 1. FUNCIONALIDAD DE INTERFAZ (Login/Registro)
function toggleMode() {
    isLogin = !isLogin;
    const datosUsuario = document.getElementById('datosusuario');
    const title = document.getElementById('title');
    const toggleText = document.getElementById('toggle-text');

    if (datosUsuario) {
        datosUsuario.style.display = isLogin ? "none" : "block";
    }
    title.innerText = isLogin ? "Iniciar Sesión" : "Crear Cuenta";
    toggleText.innerText = isLogin ? "¿No tienes cuenta? Regístrate" : "Ya tengo cuenta. Entrar";
}


//establecemos funcion de autenticacion y registro
function auth() {
    const miembro = document.getElementById('user').value;
    const clave = document.getElementById('pass').value;

    let Arreglo = JSON.parse(localStorage.getItem('wallet_users')) || {};

    if (isLogin) {
        // Lógica de Inicio de Sesión
        if (Arreglo[miembro] && Arreglo[miembro].pass === clave) {
            sessionStorage.setItem('active_user', miembro); // Guardamos quién entró
            window.location.href = 'menu.html'; // Redirigir al menu
        } else {
            alert("Los Datos Ingresados no corresponden a un usuario registrado.");
        }
    } else {
        // Lógica de Registro
        if (Arreglo[miembro]) {
            alert("El usuario ya existe.");
        } else {
            // Capturamos los datos adicionales
            const nombre = document.getElementById('nombre').value;
            const rut = document.getElementById('rut').value;
            const banco = document.getElementById('banco').value;
            const tcuenta = document.getElementById('tcuenta').value;
            const ncuenta = document.getElementById('ncuenta').value;

            // Guardamos los datos completos
            Arreglo[miembro] = {
                pass: clave,
                nombre: nombre,
                rut: rut,
                banco: banco,
                tcuenta: tcuenta,
                ncuenta: ncuenta,
                balance:50.000,
                movements: []
            };
            //variable localstorage tipo arreglo que permite que la informacion este disponible
            //en todos los Dom que lo requieran
            localStorage.setItem('wallet_users', JSON.stringify(Arreglo));
            alert("¡Cuenta creada exitosamente! Ahora inicia sesión.");
            toggleMode();
        }
    }
}

//carga los datos a la grafica de la tarjeta creada con css
function cargarDatosMenu() {
    const userKey = sessionStorage.getItem('active_user');
    const usuarios = JSON.parse(localStorage.getItem('wallet_users')) || {};
    const datos = usuarios[userKey];

    if (datos) {
        // Actualizar el saldo principal (el grande en verde)
        const balanceElem = document.getElementById('balance');
        if (balanceElem) balanceElem.textContent = `$${datos.balance.toLocaleString('es-CL')}`;

        // Datos dentro de la tarjeta visual
        if (document.getElementById('nombre-card'))
            document.getElementById('nombre-card').textContent = datos.nombre;

        if (document.getElementById('banco-card'))
            document.getElementById('banco-card').textContent = datos.banco || "Alke Wallet";

        if (document.getElementById('ncuenta-card'))
            document.getElementById('ncuenta-card').textContent = datos.ncuenta;

        if (document.getElementById('tcuenta-card'))
            document.getElementById('tcuenta-card').textContent = datos.tcuenta;

        // Datos informativos extras
        if (document.getElementById('rut-card'))
            document.getElementById('rut-card').textContent = datos.rut;
    } else {
        // Seguridad: si intentan entrar sin login, los mandamos fuera
        window.location.href = 'index.html';
    }
}


// Aseguramos que se dispare al entrar a menu.html se asegura de que este en el index para activar rellenar los datos
if (window.location.pathname.includes("menu.html")) {
    window.addEventListener('load', cargarDatosMenu);
}



//espera a que carge completamente la pagina para activar las opciones de ingreso
window.onload = function () {
    if (window.location.pathname.includes("menu.html")) {
        cargarDatosDashboard();
    }
};

//funcion dependiente de la carga a cuenta propia
function cargarDatosDeposito() {
    const userKey = sessionStorage.getItem('active_user');
    const usuarios = JSON.parse(localStorage.getItem('wallet_users')) || {};
    const datos = usuarios[userKey];

    if (datos) {
        // Mostrar datos en la tarjeta y saldos
        document.getElementById('banco-card').textContent = datos.banco;
        document.getElementById('nombre-card').textContent = datos.nombre;
        document.getElementById('tcuenta-card').textContent = datos.tcuenta;
        document.getElementById('current-balance').textContent = `$${datos.balance.toLocaleString()}`;

        // Listener para mostrar el total en tiempo real mientras el usuario escribe
        const inputMonto = document.getElementById('topup-amount');
        inputMonto.addEventListener('input', () => {
            const monto = parseFloat(inputMonto.value) || 0;
            const nuevoTotal = datos.balance + monto;
            document.getElementById('preview-total').textContent = `Nuevo total tras recarga: $${nuevoTotal.toLocaleString()}`;
        });
    }
}

// LEE Y SUMA EL SALDO INGRESADO POR EL USUARIO Y LO REGISTR LS
function topUp() {
    const userKey = sessionStorage.getItem('active_user');
    let usuarios = JSON.parse(localStorage.getItem('wallet_users')) || {};

    const inputMonto = document.getElementById('topup-amount');
    const monto = parseFloat(inputMonto.value);

    //VALIDACIONES DE SEGURIDAD
    if (!userKey || !usuarios[userKey]) return alert("Sesión no válida");
    if (isNaN(monto) || monto <= 0) return alert("Ingrese un monto válido");

    //actualizamos el saldo
    usuarios[userKey].balance += monto;

    //REGISTRO DE HISTORIAL PARA MOV
    const nuevaTransaccion = {
        tipo: 'Recarga',
        monto: monto,
        fecha: new Date().toLocaleString('es-CL'),
        detalle: 'Abono directo'
    };

    //ARRAY POR SI NO EXISTE EL GUARDAR
    if (!usuarios[userKey].movements) usuarios[userKey].movements = [];
    usuarios[userKey].movements.push(nuevaTransaccion);

    //GUARGAR ARREGLO LOCALSTORAGE
    localStorage.setItem('wallet_users', JSON.stringify(usuarios));

    alert(`¡Recarga exitosa! Nuevo saldo: $${usuarios[userKey].balance.toLocaleString('es-CL')}`);

    //REDIRECCIONAMOS AL MENU
    window.location.href = 'menu.html';
}

// ASEGURAMOS QUE SE CARGEN LOS DATOS EN DEPOSIT
if (window.location.pathname.includes("deposit.html")) {
    window.onload = cargarDatosDeposito;
}

//DATOS PARA TRANSFERENCIAS

function inicializarTransferencia() {
    const userKey = sessionStorage.getItem('active_user');
    const usuarios = JSON.parse(localStorage.getItem('wallet_users')) || {};
    const emisor = usuarios[userKey];
    const selectDest = document.getElementById('dest-user-select');

    if (emisor) {
        // 1. Mostrar datos del emisor en la tarjeta
        document.getElementById('banco-card').textContent = emisor.banco || "Billetera";
        document.getElementById('ncuenta-card-display').textContent = emisor.ncuenta || "****";
        document.getElementById('nombre-card').textContent = emisor.nombre;
        document.getElementById('current-balance').textContent = `$${emisor.balance.toLocaleString()}`;

        // 2. Cargar destinatarios (todos menos el actual)
        selectDest.innerHTML = '<option value="">Seleccione un contacto</option>';
        Object.keys(usuarios).forEach(userEmail => {
            if (userEmail !== userKey) {
                const opt = document.createElement('option');
                opt.value = userEmail;
                opt.textContent = `${usuarios[userEmail].nombre} (${usuarios[userEmail].banco})`;
                selectDest.appendChild(opt);
            }
        });
    }
}

function transferir() {
    const userKey = sessionStorage.getItem('active_user');
    const destKey = document.getElementById('dest-user-select').value;
    const montoInput = document.getElementById('transfer-amount');
    const monto = parseFloat(montoInput.value);

    let usuarios = JSON.parse(localStorage.getItem('wallet_users')) || {};

    // VALIDACIONES
    if (!userKey || !usuarios[userKey]) return alert("Sesión expirada.");
    if (!destKey) return alert("Selecciona a un destinatario de la lista.");
    if (isNaN(monto) || monto <= 0) return alert("Ingresa un monto válido.");
    if (usuarios[userKey].balance < monto) return alert("Saldo insuficiente.");

    // PROCESO CONTABLE
    usuarios[userKey].balance -= monto; // Resta al emisor
    usuarios[destKey].balance += monto; // Suma al receptor

    // REGISTRO DE MOVIMIENTOS
    const fecha = new Date().toLocaleString('es-CL');

    // Movimiento para el que envía
    usuarios[userKey].movements.push({
        tipo: 'Envío',
        monto: monto,
        detalle: `A: ${usuarios[destKey].nombre}`,
        fecha: fecha
    });

    // Movimiento para el que recibe
    usuarios[destKey].movements.push({
        tipo: 'Recepción',
        monto: monto,
        detalle: `De: ${usuarios[userKey].nombre}`,
        fecha: fecha
    });

    // GUARDAR Y FINALIZAR
    localStorage.setItem('wallet_users', JSON.stringify(usuarios));

    alert(`¡Transferencia exitosa!\nHas enviado $${monto.toLocaleString()} a ${usuarios[destKey].nombre}`);

    window.location.href = 'menu.html';
}

//EJECUTAR AL CARGAR SENDMONEY
if (window.location.pathname.includes("sendmoney.html")) {
    window.onload = inicializarTransferencia;
}

//INICIALIZAR CARGAR PAGINA
if (window.location.pathname.includes("sendmoney.html")) {
    window.onload = cargarDatosSendMoney;
}

// 1. FUNCIÓN PARA AGREGAR DESTINATARIOS
function agregarDestinatario() {
    const nombre = document.getElementById('new-dest-name').value;
    const email = document.getElementById('new-dest-email').value;

    if (!nombre || !email) return alert("Completa los datos del contacto");

    let usuarios = JSON.parse(localStorage.getItem('wallet_users')) || {};

    // Si el usuario no existe en la "red", lo creamos con saldo 0
    if (!usuarios[email]) {
        usuarios[email] = {
            nombre: nombre,
            pass: "1234", // Password genérica por defecto
            balance: 0,
            movements: [],
            banco: "Alke Wallet",
            ncuenta: "CTA-" + Math.floor(Math.random() * 1000000)
        };
        localStorage.setItem('wallet_users', JSON.stringify(usuarios));
        alert("Contacto agregado correctamente.");
        cargarDatosSendMoney();// SELECT
    } else {
        alert("Este usuario ya está en tu lista de contactos.");
    }
}

function cargarDatosSendMoney() {
    console.log("Cargando datos en SendMoney..."); // Para depuración por error inesperado
    const userKey = sessionStorage.getItem('active_user');
    const usuarios = JSON.parse(localStorage.getItem('wallet_users')) || {};
    const emisor = usuarios[userKey];

    if (emisor) {
        //ACTUALIZAMOS NOMBRE
        const nombreCard = document.getElementById('nombre-card');
        if (nombreCard) nombreCard.textContent = emisor.nombre;

        //ACTUALIZAMOS SALDO
        const saldoCard = document.getElementById('saldo-emisor-tarjeta');
        if (saldoCard) {
            // FORZAMOS EL FORMATO MONEDA CHILEMA
            const saldoFormateado = new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
            }).format(emisor.balance);

            saldoCard.textContent = saldoFormateado;
            console.log("Saldo cargado con éxito:", saldoFormateado);
        } else {
            console.error("No se encontró el elemento con ID 'saldo-emisor-tarjeta'");
        }

        //CARGAMOS LOS CONTACTOS
        const selectDest = document.getElementById('dest-user-select');
        if (selectDest) {
            selectDest.innerHTML = '<option value="">Seleccione un contacto</option>';
            Object.keys(usuarios).forEach(email => {
                if (email !== userKey) {
                    const opt = document.createElement('option');
                    opt.value = email;
                    opt.textContent = `${usuarios[email].nombre} (${email})`;
                    selectDest.appendChild(opt);
                }
            });
        }
    }
}


// INICIALIZAMOS SENDMONEY
if (window.location.pathname.includes("sendmoney.html")) {
    window.onload = cargarDatosSendMoney;
}
//FUNCION CARGAR PAGINA
window.addEventListener('load', () => {
    if (window.location.pathname.includes("sendmoney.html")) {
        cargarDatosSendMoney();
    }
});

//FUNCIÓN PARA ELIMINAR
function eliminarContacto(emailEliminar) {
    //PEDIREMOS AL USUARIO QUE CONFIRME ANTES DE BORRAR
    const confirmar = confirm(`¿Estás seguro de que quieres eliminar a ${emailEliminar} de tus contactos?`);

    if (confirmar) {
        let usuarios = JSON.parse(localStorage.getItem('wallet_users')) || {};

        // ELIMINAMOS PROPIEDAD
        delete usuarios[emailEliminar];

        // Guardamos los datos actualizada
        localStorage.setItem('wallet_users', JSON.stringify(usuarios));

        alert("Contacto eliminado con éxito.");

        //REFRESCAMOS LA VISTA
        cargarDatosSendMoney();
    }
}

//FUNCION PARA MOSTRAR LOS MOVIMIENTOS DE LA CUENTA

function cargarMovimientos() {
    const userKey = sessionStorage.getItem('active_user');
    const usuarios = JSON.parse(localStorage.getItem('wallet_users')) || {};
    const datos = usuarios[userKey];
    const tablaMovimientos = document.getElementById('mov-list-table');
 //CLEAR A LA TABLA
    if (datos && datos.movements) {
        tablaMovimientos.innerHTML = '';

        //ORDENAMOS Y MOSTRAMOS LOS MOV DEL MAS ACTUAL AL MAS ANTIGUO
        [...datos.movements].reverse().forEach(mov => {
            const fila = document.createElement('tr');

            //COLORES PARA EL MONTO
            const esIngreso = mov.tipo === 'Recarga' || mov.tipo === 'Recepción';
            const colorClase = esIngreso ? 'text-success' : 'text-danger';
            const signo = esIngreso ? '+' : '-';

            // MOVIMIENTO POR DEFECTO EN CASO DE QUE NO HAYAN DATOS O CLIENTE NUEVO
            const detalle = mov.detalle || "Sin descripción";

            fila.innerHTML = `
                <td><small>${mov.fecha}</small></td>
                <td><span class="badge ${esIngreso ? 'bg-success' : 'bg-danger'}">${mov.tipo}</span></td>
                <td>${detalle}</td>
                <td class="text-end fw-bold ${colorClase}">
                    ${signo} $${mov.monto.toLocaleString('es-CL')}
                </td>
            `;
            tablaMovimientos.appendChild(fila);
        });
    } else {
        tablaMovimientos.innerHTML = '<tr><td colspan="4" class="text-center">No hay movimientos registrados.</td></tr>';
    }
}
window.addEventListener('load', () => {
    const path = window.location.pathname;
    if (path.includes("menu.html")) cargarDatosMenu();
    if (path.includes("deposit.html")) cargarDatosDeposito();
    if (path.includes("sendmoney.html")) cargarDatosSendMoney();
    if (path.includes("transactions.html")) cargarMovimientos();
});
//FUNCION PARA CERRAR SESION
function logout() {
    // Preguntamos para confirmar (opcional)
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        // Borramos el usuario activo de la sesión
        sessionStorage.removeItem('active_user');

        // Redirigimos al Login
        window.location.href = 'index.html';
    }
}

