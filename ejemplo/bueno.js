
$(document).ready(function () {


   const form = $('.formulario')[0];
   let fecha;
   $('#fecha_prestamo').change((e) => {

       fecha = $(e.target).val();
       calcularfecha(fecha)
           .then(result => {
               // que muestre el resultado si la promesa se resuelve correctamente
               $("#cuotas_pe").val(result.Cuotapendiente);

           }).catch(err => {
               // si la promesa se resulve incorrectamente, muestra el error
               console.error("Error al calcular", err);
           });

   });

   $('#val_pres').keyup((e) => {
       form.classList.add('was-validated')
       const valor_pres = parseInt($(e.target).val());
       const cuotas_pe = parseInt($('#cuotas_pe').val());
       const val_inte = parseInt($('#intereses').val());

       const tot = (valor_pres + valor_pres * val_inte / 100 * cuotas_pe);
       $('#total').val(tot);
   });

   $('#modalpagos').on('show.bs.modal', function (e) {
       const form = $('.formulario')[0];
       if (!form.checkValidity()) {
           e.preventDefault()//Evita abrir el modal 
           e.stopPropagation()
           form.classList.add('was-validated')

           Swal.fire({
               icon: "error",
               title: "Oops...",
               text: "Debe llenar todos los campos!",

           });
           return; //detiene el modal
       } else {

           let interes = parseFloat($("#intereses").val());
           // isNumber(interes)?console.log(interes) : console.log('no es numero');
           let pendiente = parseFloat($("#cuotas_pe").val());
           let valpres = parseFloat($('#val_pres').val());
           const tot = $('#total').val();


           if (isNaN(interes) || isNaN(valpres)) {
               form.classList.remove('was-validated');
               e.preventDefault()//Evita abrir el modal 
               e.stopPropagation();
               isNaN(interes) ? $("#intereses").addClass('is-invalid') : $('#val_pres').addClass('is-invalid');
               form.classList.remove('is-invalid')
               return; //detiene el modal
           } else {
               $('.invalid-feedback').css('display', 'none');
               const formulario = $('.formulario');
               const formu = formulario.find('input');
               formu.each(function () {
                   $(this).removeClass('is-invalid');
               });

           }

           let deuda_actual;

           if ((valpres < tot) && pendiente !== 0) {
               deuda_actual = valpres;
           } else {
               deuda_actual = tot;
           }

           let valInt = parseFloat(deuda_actual * parseFloat(interes)) / 100;



           let deuda = tot;
           $('#prestamo').val($("#total").val());
           $('#interes').val(interes + ' %');
           $('#valor').keyup((e) => {
               let pago = $(e.target).val();
               calcularPago(pago, deuda, valInt, pendiente)
                   .then(resultado => {
                       // si la promesa se resulve correctamente,que muestre el resultado
                       if (resultado.numCuota >= 1) {
                           $('#cuota').val(resultado.numCuota);
                           $("#pago_interes").val(resultado.pagoInteres);
                           $("#pago_capital").val(resultado.pagoCapital);
                           $("#valor_actual").val(resultado.valorActual);
                       }

                   }).catch(error => {
                       // si la promesa se resulve incorrectamente, muestra el error
                       console.error("Error al calcular", error);
                   });
           });
       }
   });
   function calcularPago(p, d, valInt, pe) {

       return new Promise((resolve, reject) => {

           let pago_interes;
           let cuota = (p / valInt).toFixed(1);
           let valActual;
           if (pe !== 0 && cuota <= pe) {
               pago_interes = parseFloat(cuota) * valInt;
               valActual = d - pago_interes;
           } else {
               pago_interes = parseFloat(pe) * valInt;
               valActual = d - p;
           }
           let capital = p - pago_interes;
           if (cuota >= 0) {
               resolve({
                   numCuota: Number(cuota),
                   pagoCapital: capital,
                   pagoInteres: pago_interes,
                   valorActual: valActual
               });
           } else {
               reject('El cálculo de la cuota es invalido');
           }
       });
   }
   function calcularfecha(fec) {
       return new Promise((resolve, reject) => {

           let fecha_pres = new Date(fec);
           let fechaActual = new Date();
           // Calcular la diferencia en años y meses
           let difAnios = fechaActual.getFullYear() - fecha_pres.getFullYear();
           let difMes = fechaActual.getMonth() - fecha_pres.getMonth();
           let difdia = fechaActual.getDate() - fecha_pres.getDate();
           //Si la diferencia de los dias es negativa no ha pasado un mes
           if (difdia <= 0) {
               difMes -= 1;
           }
           let pendiente = (difAnios * 12) + difMes;
           if (pendiente === 0) {
               pendiente = 1;
           }
           resolve({
               Cuotapendiente: pendiente
           });
           reject('El cálculo de la cuota pendiente es invalida.');
       });
   }
   function limpiar() {

       let modal = $('#modalpagos').find('input');
       modal.each(function () {
           $(this).val('');
       });

   };
   $('#cerrar').click(function () {
       limpiar();
   });

   $('#guardar').click(function () {
       Swal.fire({
           icon: "success",
           title: "Guardado",
           showConfirmButton: false,
           timer: 1500
       }).then(() => {
           let cuota = parseFloat($('#cuota').val());
           let cuota_pend = parseFloat($('#cuotas_pe').val());

           if (cuota > cuota_pend) {
               cuota_pend = 0;
               $('#cuotas_pe').val(cuota_pend);
           } else {
               cuota_pend = cuota_pend - cuota;
               // cuota_pend -=  cuota;
               $('#cuotas_pe').val(cuota_pend);

           }
           $("#total").val($("#valor_actual").val());
           $("#modalpagos").modal("hide"); //cerrar el modal
           //Limpiar el modal
           limpiar();
       });
   });
});