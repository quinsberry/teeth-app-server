const { validationResult } = require('express-validator')
const dayjs = require('dayjs')
require('dayjs/locale/en')


const { Appointment, Patient } = require('../models')
const { groupBy, reduce } = require('lodash')

const { delayedSMS } = require('../utils')

function AppointmentController() { }

const create = async function (req, res) {
  const errors = validationResult(req)
  let patient

  const data = {
    patient: req.body.patient,
    dentNumber: req.body.dentNumber,
    diagnosis: req.body.diagnosis,
    price: req.body.price,
    date: req.body.date,
    time: req.body.time,
  }


  if (!errors.isEmpty()) {
    return res.status(500).json({
      success: false,
      message: errors.array()
    })
  }

  try {
    patient = await Patient.findOne({ _id: data.patient })
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: 'PATIENT_NOT_FOUND'
    })
  }



  Appointment.create(data, function (err, doc) {

    if (err) {
      return res.status(500).json({
        success: false,
        message: err
      })
    }

    const delayedTime = dayjs(`${data.date.split('.').reverse().join('.')} ${data.time}`).subtract(2, 'hour').unix()


    delayedSMS({
      number: patient.phone,
      time: delayedTime,
      text: `"White tooth", appointment at the ${data.time}.`
    })
      .then(({ data }) => {
        console.log(data)
      })
      .catch(err => {
        console.log(err)
      })

    res.status(201).json({
      success: true,
      data: doc
    })
  })
}

const remove = async function (req, res) {
  const id = req.params.id


  try {
    await Appointment.findOne({ _id: id })
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: 'APPOINTMENT_NOT_FOUND'
    })
  }

  Appointment
    .deleteOne({ _id: id }, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err
        })
      }

      res.json({
        success: true
      })
    })
}

const update = async function (req, res) {
  const errors = validationResult(req)
  const appointmentId = req.params.id

  const data = {
    dentNumber: req.body.dentNumber,
    diagnosis: req.body.diagnosis,
    price: req.body.price,
    date: req.body.date,
    time: req.body.time,
  }


  if (!errors.isEmpty()) {
    return res.status(500).json({
      success: false,
      message: errors.array()
    })
  }


  Appointment.updateOne(
    { _id: appointmentId },
    { $set: data },
    function (err, doc) {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err
        })
      }

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: 'APPOINTMENT_NOT_FOUND'
        })
      }

      res.status(200).json({
        success: true,
        data: doc
      })
    })
}

const all = function (req, res) {
  Appointment
    .find({})
    .populate('patient')
    .exec(function (err, docs) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err
        })
      }

      const sortedDates = data => {
        const sortedDates = Object.keys(groupBy(data, 'date')).map(item => item.split('.').reverse().join('-')).sort().map(item => dayjs(item).locale('en').format('MMMM  D'))
        const unsorted = reduce(groupBy(data, 'date'), (result, value, key) => {
          const dateRightFormat = key.split('.').reverse().join('-')
          result = [...result, { title: dayjs(dateRightFormat).locale('en').format('MMMM  D'), data: value }]
          return result
        }, [])
        const finish = sortedDates.map(item => unsorted.filter(day => day.title === item))
        return finish.reduce((prev, item) => prev.concat(item))
      }

      res.status(201).json({
        success: true,
        data: sortedDates(docs),
      })
    })
}

AppointmentController.prototype = {
  create,
  all,
  remove,
  update
}


module.exports = AppointmentController