const { Router } = require('express');
const ServicioModel = require('../models/servicio');
const { default: mongoose } = require('mongoose');
const dayjs = require('dayjs');
const moment = require('moment');
const TurnoModel = require('../models/turno');

const router = Router();


function obtenerHorariosDisponibles(esHoy, desde, hasta, duracion, turnosReservados) {
    const bloquesDisponibles = [];

    const fechaActual = moment();

    if(esHoy == true) {
        console.log(fechaActual)
        console.log("es hoy")
    }
    const startTime = moment(desde, 'HH:mm');
    const endTime = moment(hasta, 'HH:mm');

    let currentTime = startTime.clone();

    while (currentTime.isBefore(endTime)) {
        const bloqueInicio = currentTime.clone();
        const bloqueFin = bloqueInicio.clone().add(duracion, 'minutes');

        if(bloqueFin.isAfter(endTime)) {
            break;
        }
        let pase = false;

        if(!esHoy) pase = true;
        else if(!fechaActual.isAfter(currentTime)) pase = true;//pongo la variable pase porque noté que es un poquito mas rapido xd, para que no haga comprobacion de fecha al pedo

        if(pase) {
            const bloqueOcupado = turnosReservados.some(turno => {
                const turnoHora = moment(turno.hora, 'HH:mm');
                return turnoHora.isBetween(bloqueInicio, bloqueFin, null, '[)');
            });
            if (!bloqueOcupado) {
                bloquesDisponibles.push({
                    desde: bloqueInicio.format('HH:mm'),
                    hasta: bloqueFin.format('HH:mm')
                });
            }
        }

        currentTime.add(duracion, 'minutes');
    }

    return bloquesDisponibles;
}

router.get('/fechas-disponibles/:id', async (req, res) => {
    const { id } = req.params; // ID del servicio
    const { fecha } = req.query; // Fecha desde la cual se calcularán las fechas disponibles, formato 'YYYY-MM-DD'

    try {
        const servicio = await ServicioModel.findById(id);
        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        const disponibilidad = servicio;
        const duracion = disponibilidad.duracion;
        const fechaReferencia = moment(fecha, 'YYYY-MM-DD'); // Fecha base del mes solicitado
        const fechaActual = moment().startOf('day');

        let turnosDisponibles = [];

        for (let fechaDisp of disponibilidad.fechas) {
            const { fecha, dia_semana, horarios, repite } = fechaDisp;

            let fechasParaRevisar = [];

            if (repite) {
                let siguienteFecha = moment(fecha).day(dia_semana).startOf('day');
                while (siguienteFecha.isBefore(fechaActual)) {
                    siguienteFecha.add(1, 'week');
                }
                while (fechasParaRevisar.length < 10) {
                    fechasParaRevisar.push(siguienteFecha.clone());
                    siguienteFecha.add(1, 'week');
                }
            } else {
                fechasParaRevisar.push(moment(fecha).startOf('day'));
            }

            for (let fechaParaRevisar of fechasParaRevisar) {
                // Verificar si la fecha está en el mismo mes y año que la fecha de referencia
                if (
                    fechaParaRevisar.year() === fechaReferencia.year() &&
                    fechaParaRevisar.month() === fechaReferencia.month()
                ) {
                    const turnosReservados = await TurnoModel.find({
                        fecha: fechaParaRevisar.format('YYYY-MM-DD'),
                        cancelado: false
                    });

                    for (let horario of horarios) {
                        const bloquesDisponibles = obtenerHorariosDisponibles(
                            fechaActual.isSame(fechaParaRevisar, 'day'),
                            horario.desde,
                            horario.hasta,
                            duracion,
                            turnosReservados
                        );

                        if (bloquesDisponibles.length > 0) {
                            const index_fecha = turnosDisponibles.findIndex(j => j.fecha == fechaParaRevisar.format('YYYY-MM-DD'));
                            if (index_fecha == -1) {
                                turnosDisponibles.push({
                                    fecha: fechaParaRevisar.format('YYYY-MM-DD'),
                                    bloques: bloquesDisponibles
                                });
                            } else {
                                turnosDisponibles[index_fecha].bloques.push(...bloquesDisponibles);
                            }
                        }
                    }
                }
            }
        }

        res.json(turnosDisponibles);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error al obtener las fechas disponibles', error });
    }
});

router.get('/disponibilidad/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { fecha } = req.query;
        console.log(fecha)

        res.send(horariosDisponibles)
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
})

router.get('/:id', async (req, res) => {
    try {

        const id = req.params.id;

        const result = await ServicioModel.findOne({_id: id})
        res.send(result)
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
})


router.get('/', async (req, res) => {
    try {
        const result = await ServicioModel.find()
        res.send(result)
    }
    catch(err) {
        res.status(503).send()
    }
})

router.post('/', async (req, res) => {
    try {
        const {
            nombre,
            precio,
            duracion
        } = req.body;

        if(!nombre) return res.status(503).send()
        if(!precio) return res.status(503).send()
        if(!duracion) return res.status(503).send()

        const nuevoServicio = new ServicioModel({
            nombre,
            precio,
            duracion
        })

        const result = await nuevoServicio.save()
        res.send(result)
    }
    catch(err) {
        console.log(err)
        res.status(503).send()
    }
})

router.put('/', async (req, res) => {
    try {
        const {
            servicio_id,
            duracion,
            fechas,
            nombre,
            precio
        } = req.body;

        await ServicioModel.updateOne({_id: servicio_id}, {
            duracion,
            fechas,
            nombre,
            precio
        })

        res.send()
    }
    catch(err){
        console.log(err)
        res.status(503).send()
    }
})

module.exports = router;