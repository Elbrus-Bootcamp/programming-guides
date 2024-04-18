


# MVC Example

### Patient Model
```js
class Patient {
  constructor(dateOfBirth, medicalRecordsNumber, name) {
    this.dateOfBirth = dateOfBirth;
    this.medicalRecordsNumber = medicalRecordsNumber;
    this.name = name;
  }

  // dateOfBirth
  get dob() {
    return this.dateOfBirth;
  }

  // medicalRecordsNumber
  get mrn() {
    return this.medicalRecordsNumber;
  }

  get name() {
    return this.name;
  }

}
```


### Patient View
```js
class PatientView {
  static show(patient) {
    console.log(`${patient.mrn} - ${patient.name} (DOB: ${patient.dob})`);
  }

  formatdob(date) {
    return date;
  }

}

```


### Hospital Model
```js
class Hospital {
  constructor(name, patients) {
    this.name = name;
    this.#patients = patients;
  }

  get patients() {
    return this.patients;
  }

  // assume that there is only one patient with name
  findPatientByName(name) {
    return this.#patients.find(patient => patient.name === name);
  }

  patientsCount() {
    return this.patients.count;
  }
}
```


### Hospital View
```js
class HospitalView {
  static show(hospital) {
    console.log(`${hospital.name}\n${hospital.patientsCount()} patients admitted`);
  }
}
```


### Hospital Controller

```js
class HospitalController {

  constructor(hospital) {
    this.hospital = hospital;
  }

  run(command, options) {
    if (command === 'hospital') {
      this.showhospital();
    } else if (command === 'patient') {
      this.showpatient(options[0]);
    }
  }

  get hospital() {
    return this.#hospital;
  }

  show_hospital() {
    HospitalView.show(this.hospital);
  }

  show_patient(search_name) {
    let patient = this.hospital.findPatientByName(search_name);
    if(patient) {
      PatientView.show(patient);
    }
    else {
      console.log(`Could not find a patient with the name ${search_name}`);
    }
  }
}
```


### Runner
```js
// Runner
let Patient = require('./patient.js');
let PatientView = require('./patient_view');
let Hospital = require('./hospital.js');
let HospitalView = require('./hospital_view.js');
let HospitalController = require('./hospital_controller.js');


let args = process.argv.slice(2);

if(argv.length > 0) {
  let patients = []// Create a collection of patient objects
}

let hospital = new Hospital('St. Charles Hospital', patients);
let controller = new HospitalController(hospital);

controller.run(args);

```
