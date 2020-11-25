const { validationResult } = require('express-validator')
const { Patient } = require('../models')

function PatientController() { }

const create = function (req, res) {
  const data = {
    fullName: req.body.fullName,
    phone: req.body.phone
  }

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(500).json({
      success: false,
      message: errors.array()
    })
  }

  Patient.create(data, function (err, doc) {

    if (err) {
      return res.status(500).json({
        success: false,
        message: err
      })
    }

    res.status(201).json({
      success: true,
      data: doc
    })
  })
}

const remove = async function (req, res) {
  const id = req.params.id


  try {
    await Patient.findOne({ _id: id })
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: 'PATIENT_NOT_FOUND'
    })
  }

  Patient
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
  const patientId = req.params.id

  const data = {
    fullName: req.body.fullName,
    phone: req.body.phone
  }


  if (!errors.isEmpty()) {
    return res.status(500).json({
      success: false,
      message: errors.array()
    })
  }


  Patient.updateOne(
    { _id: patientId },
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
          message: 'PATIENT_NOT_FOUND'
        })
      }

      res.status(200).json({
        success: true
      })
    })
}

const show = async function (req, res) {
  const patientId = req.params.id
  try {
    const patient = await Patient.findById(patientId)
      .populate('appointments')
      .exec()

    res.status(200).json({
      success: true,
      data: { ...patient._doc, appointments: patient.appointments },
    })
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: 'PATIENT_NOT_FOUND'
    })
  }
}

const all = function (req, res) {
  Patient.find({}, function (err, doc) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err
      })
    }

    res.status(200).json({
      success: true,
      data: doc
    })
  })
}

PatientController.prototype = {
  create,
  all,
  remove,
  update,
  show
}



module.exports = PatientController