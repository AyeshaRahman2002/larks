from flask import request, jsonify, make_response
from flask_jwt_extended import jwt_required
from app import models, db
from app.endpoints import auth_bp
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn import svm
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
import joblib # has methods for saving and loading models
import os
import sys
from sqlalchemy import create_engine, or_
import pandas as pd
from datetime import datetime
from dateutil.relativedelta import relativedelta

@auth_bp.route('/api/roots-radar/mvp-string', methods=['GET', 'POST'])
@jwt_required()
def mvpString():
  if request.method == 'GET':
    id = request.args.get('id')

    query_result = models.RootRadarMVPTest.query.filter_by(id=id).first()

    if query_result:
      response = make_response(jsonify({"text": query_result.text}))
      response.status_code = 200
      return response

    else:
      response = make_response(jsonify({"msg": "no record with that id exists"}))
      response.status_code = 400
      return response

  elif request.method == 'POST':
    text = request.get_json()['text']

    if (not text):
      response = make_response(jsonify({"msg": "no text attribute was supplied"}))
      response.status_code = 400
      return response

    new_record = models.RootRadarMVPTest(text=text)
    db.session.add(new_record)
    db.session.commit()

    response = make_response(jsonify({"id": new_record.id}))
    response.status_code = 200
    return response

@auth_bp.route('/api/roots-radar/music_prediction', methods=['GET'])
def music():
  age = request.args.get('age') # age is number >= 0
  sex = request.args.get('sex') # sex is either 1 or 0

  this_dir = os.path.dirname(__file__)
  M = joblib.load(f'{this_dir}/music_reccommender.joblib')
  genre = M.predict([[age, sex]])[0]

  response = make_response(jsonify({"msg": f"Genre: {genre}"}))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/scv_linear', methods=['POST'])
def first_predict_svc_linear():
  query = request.get_json()['query']
  print(query)
  this_dir = os.path.dirname(__file__)
  # FROM SCRIPT MODEL
  #M = joblib.load(f'{this_dir}/classifier-LinearSVM-joblib-dump.joblib')
  M = joblib.load(f'{this_dir}/classifier-linear-svc-FROMDATABASE-inAPI-joblib-dump.joblib')
  # TODO: check input data
  subclass = M.predict([query])[0]
  response = make_response(jsonify({"msg": f"Class: {subclass}"}))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/make_model_from_database', methods=['POST'])
def make_model_from_database():
  cnx = create_engine('sqlite:///app.db').connect()
  df = pd.read_sql_table('patient', cnx)
  df.drop('id', axis=1, inplace=True)
  df.drop('DisorderSubclassPredicted', axis=1, inplace=True)

  # TODO: Now patients may not have a disorder so NaNs can appear in target.
  # Need to sanitize input. Will need to do more sanitization when full
  # TODO: Will need to sanitise parents links and doctors auth links too in real data.

  targetColumn = 'DisorderSubclass'
  output_set = df[targetColumn]
  input_set = df.drop(columns=[targetColumn])
  X_train, X_test, Y_train, Y_test = train_test_split(input_set, output_set, test_size=0.2, random_state = 1)

  model = svm.SVC(kernel='linear') # Linear Kernel
  model.fit(X_train, Y_train)

  prediction = model.predict(X_test)
  acc = accuracy_score(Y_test, prediction)

  this_dir = os.path.dirname(__file__)
  joblib.dump(model, f'{this_dir}/classifier-linear-svc-FROMDATABASE-inAPI-joblib-dump.joblib')

  response = make_response(jsonify({"msg": "Model created with accuracy = " + str(acc)}))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/make_model_from_mimic_database', methods=['POST'])
def make_model_from_mimic_database():
  cnx = create_engine('sqlite:///app.db').connect()
  patients = pd.read_sql_table('patients', cnx)

  target = pd.read_sql_table('patient', cnx)
  target.drop('id', axis=1, inplace=True)
  target.drop('DisorderSubclassPredicted', axis=1, inplace=True)

  # For all patients with a REAL disorder subclass (X00012 27709 27501)
  #       - with GENDER bloodCellCount RespiratoryRate HeartRate whiteBloodCellCount BloodTestResult
  #       - and a MOTHER (MOTHER_SUBJECT_ID) != NONE
  #         - with DOB pregnencyDueDate FolicAcidDetails numberOfPreviousAbortions
  #       - and a FATHER (FATHER_SUBJECT_ID) != NONE
  #         - with DOB
  #       - we need to make them a row in this table (patients)

  data = []

  for index, row in patients.iterrows():
    # make a big object for patient here
    NEWPATIENT = {
      'PatientAge': relativedelta(datetime.now(), row['DOB']).years,
      'GenesInMothersSide': '', # DONE
      'InheritedFromFather': '', # DONE
      'MaternalGene': '', # DONE
      'PaternalGene': '', # DONE
      'BloodCellCount_mcL': '', # DONE
      'MothersAge': '', # DONE
      'FathersAge': '', # DONE
      'RespiratoryRate_breathsPerMin': '', # DONE
      'HeartRate_ratesPermin': '', # DONE
      'Gender': '', # DONE
      'BirthAsphyxia': '', # DONE
      'FolicAcidDetails_periConceptiona': '', # DONE 
      'HistoryOfSeriousMaternalIllness': '', # DONE
      'HistoryOfRadiationExposure_xRay': '', # DONE
      'HistoryOfSubstanceAbuse': '', # DONE
      'AssistedConception_IVF_ART': '', # DONE
      'HistoryOfAnomaliesInPreviousPregnancies': '', # DONE
      'NumberOfPreviousAbortions': '', # DONE
      'BirthDefects': '', # DONE
      'WhiteBloodCellCount_thousand_per_microliter': '', # DONE
      'BloodTestResult': '', # DONE
      'Symptom1': '', # DONE 
      'Symptom2': '', # DONE
      'Symptom3': '', # DONE
      'Symptom4': '', # DONE
      'Symptom5': '', # DONE
      'DisorderSubclass': '', # DONE
    }
    if models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='X00012').first() != None:
        # disorder is tay sachs
        NEWPATIENT['DisorderSubclass'] = 5 ## "Tay-Sachs"
        pass    
    elif models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='27709').first() != None:
        # disorder is Cystic fibrosis
        NEWPATIENT['DisorderSubclass'] = 0 ## "Cystic fibrosis"
        pass    
    elif models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='27501').first() != None:
        # disorder is Heredit hemochromatosis
        NEWPATIENT['DisorderSubclass'] = 6 ## "Hemochromatosis"
        pass    
    else:
        continue # not valid

    mother = None
    father = None

    # Check mother exists
    mQ = models.PATIENTS.query.filter_by(SUBJECT_ID=row['MOTHER_SUBJECT_ID']).all()
    if len(mQ) != 0:
        mother = mQ[0]
        x = datetime.strptime(str(row['DOB']), '%Y-%m-%d %H:%M:%S')
        y = datetime.strptime(str(mother.DOB), '%Y-%m-%d')
        # print()
        # print(row['DOB'])
        # print(mother.DOB)
        # break
        # Calculate Mothers age at birth
        NEWPATIENT['MothersAge'] = relativedelta(x, y).years
    else:
        continue # not valid


    # Check father exists
    fQ = models.PATIENTS.query.filter_by(SUBJECT_ID=row['FATHER_SUBJECT_ID']).all()
    if len(fQ) != 0:
        father = fQ[0]
        # Calculate Fathers age at birth
        x = datetime.strptime(str(row['DOB']), '%Y-%m-%d %H:%M:%S')
        y = datetime.strptime(str(father.DOB), '%Y-%m-%d')
        NEWPATIENT['FathersAge'] = relativedelta(x, y).years
    else:
        continue # not valid

    # Put Patient Gender in
    NEWPATIENT['Gender'] = 1 if row['GENDER'] == "M" else 0 # TODO: Check else = 2
    
    # Put patient bloodCellCount in
    cnt = models.LABEVENTS.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ITEMID='99001').first()
    if not cnt:
        continue # not valid
    NEWPATIENT['BloodCellCount_mcL'] = cnt.VALUENUM 
    # Put patient RespiratortyRate in
    cnt = models.CHARTEVENTS.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ITEMID='220210').first()
    if not cnt:
        continue # not valid
    NEWPATIENT['RespiratoryRate_breathsPerMin'] = 1 if cnt.VALUE == "Normal (30-60)" else 0
    # Put Patient HeartRate in
    cnt = models.CHARTEVENTS.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ITEMID='220045').first()
    if not cnt:
        continue # not valid
    NEWPATIENT['HeartRate_ratesPermin'] = 1 if cnt.VALUE == "Normal" else 0
    # Put Patient whiteBloodCellCount in
    cnt = models.LABEVENTS.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ITEMID='99002').first()
    if not cnt:
        continue # not valid
    NEWPATIENT['WhiteBloodCellCount_thousand_per_microliter'] = cnt.VALUENUM
    # Put Patient BloodTestResult in
    cnt = models.LABEVENTS.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ITEMID='43176').first()
    if not cnt:
        continue # not valid
    NEWPATIENT['BloodTestResult'] = 1 if cnt.FLAG == "slightly abnormal" else 0 if cnt.FLAG  == "normal" else 2 if cnt.FLAG =="inconclusive" else 3

    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='X0004').first()
    NEWPATIENT['Symptom1'] = 1 if cnt else 0
    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='X0005').first()
    NEWPATIENT['Symptom2'] = 1 if cnt else 0
    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='X0006').first()
    NEWPATIENT['Symptom3'] = 1 if cnt else 0
    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='X0007').first()
    NEWPATIENT['Symptom4'] = 1 if cnt else 0
    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='X0008').first()
    NEWPATIENT['Symptom5'] = 1 if cnt else 0

    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='X0003').first()
    NEWPATIENT['BirthDefects'] = 1 if cnt else 0

    cnt = models.NOTEEVENTS.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, DESCRIPTION='Self assessed previous number of abortions').first()
    if not cnt:
      continue # not valid
    NEWPATIENT['NumberOfPreviousAbortions'] = cnt.TEXT

    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='7618').first()
    if not cnt: # try other value
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='7619').first()
    NEWPATIENT['HistoryOfAnomaliesInPreviousPregnancies'] = 1 if cnt else 0

    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='V2385').first()
    NEWPATIENT['AssistedConception_IVF_ART'] = 1 if cnt else 0

    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='V113').first()
    if not cnt:
        cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='X0002').first()
    if not cnt:
        cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='V113').first()
    if not cnt:
        cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='X0002').first()
    NEWPATIENT['HistoryOfSubstanceAbuse'] = 1 if cnt else 0
    
    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='V153').first()
    if not cnt:
        cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='V153').first()
    NEWPATIENT['HistoryOfRadiationExposure_xRay'] = 1 if cnt else 0

    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='7602').first()
    NEWPATIENT['HistoryOfSeriousMaternalIllness'] = 1 if cnt else 0

    cnt = models.CHARTEVENTS.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ITEMID='5067').first()
    if not cnt:
        continue # Not Valid
    NEWPATIENT['FolicAcidDetails_periConceptiona'] = 1 if cnt.VALUE == 'Yes' else 0

    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='7685').first()
    if not cnt:
        cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='7686').first()
    if not cnt:
        cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='7689').first()
    NEWPATIENT['BirthAsphyxia'] = 1 if cnt else 0

    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='V189').first()
    NEWPATIENT['PaternalGene'] = 1 if cnt else 0

    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='V189').first()
    NEWPATIENT['MaternalGene'] = 1 if cnt else 0
    
    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='X0001').first() # TODO: if input has changed this needs to change
    NEWPATIENT['InheritedFromFather'] = 1 if cnt else 0

    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='X0001').first() # TODO: if input has changed this needs to change
    NEWPATIENT['GenesInMothersSide'] = 1 if cnt else 0


    data.append([
        NEWPATIENT['PatientAge'],
        NEWPATIENT['GenesInMothersSide'],
        NEWPATIENT['InheritedFromFather'],
        NEWPATIENT['MaternalGene'],
        NEWPATIENT['PaternalGene'],
        NEWPATIENT['BloodCellCount_mcL'],
        NEWPATIENT['MothersAge'],
        NEWPATIENT['FathersAge'],
        NEWPATIENT['RespiratoryRate_breathsPerMin'],
        NEWPATIENT['HeartRate_ratesPermin'],
        NEWPATIENT['Gender'],
        NEWPATIENT['BirthAsphyxia'],
        NEWPATIENT['FolicAcidDetails_periConceptiona'],
        NEWPATIENT['HistoryOfSeriousMaternalIllness'],
        NEWPATIENT['HistoryOfRadiationExposure_xRay'],
        NEWPATIENT['HistoryOfSubstanceAbuse'],
        NEWPATIENT['AssistedConception_IVF_ART'],
        NEWPATIENT['HistoryOfAnomaliesInPreviousPregnancies'],
        NEWPATIENT['NumberOfPreviousAbortions'],
        NEWPATIENT['BirthDefects'],
        NEWPATIENT['WhiteBloodCellCount_thousand_per_microliter'],
        NEWPATIENT['BloodTestResult'],
        NEWPATIENT['Symptom1'],
        NEWPATIENT['Symptom2'],
        NEWPATIENT['Symptom3'],
        NEWPATIENT['Symptom4'],
        NEWPATIENT['Symptom5'],
        NEWPATIENT['DisorderSubclass'],
    ])

  data = [[float(item) for item in row] for row in data]
  df = pd.DataFrame(data)

  targetColumn = 27
  output_set = df[targetColumn]
  input_set = df.drop(columns=[targetColumn])
  X_train, X_test, Y_train, Y_test = train_test_split(input_set, output_set, test_size=0.2, random_state = 1)

  model = svm.SVC(kernel='linear') # Linear Kernel
  model.fit(X_train, Y_train)

  prediction = model.predict(X_test)
  acc = accuracy_score(Y_test, prediction)

  this_dir = os.path.dirname(__file__)
  joblib.dump(model, f'{this_dir}/classifier-linear-svc-mimic-joblib-dump.joblib')

  response = make_response(jsonify({"msg": "Model created with accuracy = " + str(acc)}))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/make_model_from_database', methods=['POST'])
def make_model_from_database_():
  cnx = create_engine('sqlite:///app.db').connect()
  df = pd.read_sql_table('patient', cnx)
  df.drop('id', axis=1, inplace=True)
  df.drop('DisorderSubclassPredicted', axis=1, inplace=True)

  # TODO: Now patients may not have a disorder so NaNs can appear in target.
  # Need to sanitize input. Will need to do more sanitization when full
  # TODO: Will need to sanitise parents links and doctors auth links too in real data.

  targetColumn = 'DisorderSubclass'
  output_set = df[targetColumn]
  input_set = df.drop(columns=[targetColumn])
  X_train, X_test, Y_train, Y_test = train_test_split(input_set, output_set, test_size=0.2, random_state = 1)

  model = svm.SVC(kernel='linear') # Linear Kernel
  model.fit(X_train, Y_train)

  prediction = model.predict(X_test)
  acc = accuracy_score(Y_test, prediction)

  this_dir = os.path.dirname(__file__)
  joblib.dump(model, f'{this_dir}/classifier-linear-svc-FROMDATABASE-inAPI-joblib-dump.joblib')

  response = make_response(jsonify({"msg": "Model created with accuracy = " + str(acc)}))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/new_patient', methods=['POST'])
def new_patient():
  query = request.get_json()['patients']
  this_dir = os.path.dirname(__file__)
  M = joblib.load(f'{this_dir}/classifier-linear-svc-FROMDATABASE-inAPI-joblib-dump.joblib')
  save_subclass = ''
  for patient in query:
    subclass = M.predict([patient[0:-1]])
    save_subclass = subclass
    patient.insert(0,0) # HACK to fix 1 based index
    print(f"\n\npatient = {patient}\n\n")
    new_record = models.Patient(
      PatientAge = float(patient[1]),
      GenesInMothersSide = float(patient[2]),
      InheritedFromFather = float(patient[3]),
      MaternalGene = float(patient[4]),
      PaternalGene = float(patient[5]),
      BloodCellCount_mcL = float(patient[6]),
      MothersAge = float(patient[7]),
      FathersAge = float(patient[8]),
      RespiratoryRate_breathsPerMin = float(patient[9]),
      HeartRate_ratesPermin = float(patient[10]),
      Gender = float(patient[11]),
      BirthAsphyxia = float(patient[12]),
      FolicAcidDetails_periConceptiona = float(patient[13]),
      HistoryOfSeriousMaternalIllness = float(patient[14]),
      HistoryOfRadiationExposure_xRay = float(patient[15]),
      HistoryOfSubstanceAbuse = float(patient[16]),
      AssistedConception_IVF_ART = float(patient[17]),
      HistoryOfAnomaliesInPreviousPregnancies = float(patient[18]),
      NumberOfPreviousAbortions = float(patient[19]),
      BirthDefects = float(patient[20]),
      WhiteBloodCellCount_thousand_per_microliter = float(patient[21]),
      BloodTestResult = float(patient[22]),
      Symptom1 = float(patient[23]),
      Symptom2 = float(patient[24]),
      Symptom3 = float(patient[25]),
      Symptom4 = float(patient[26]),
      Symptom5 = float(patient[27]),
      DisorderSubclass = None if patient[28] == '' else float(patient[28]),
      DisorderSubclassPredicted = subclass
    )
    db.session.add(new_record)

  db.session.commit()
  # TODO: Pull text out of subclass number.
  response = make_response(jsonify({"msg": "Patient Added", "subclass":subclass[0]}))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/patient/<id>', methods=['GET'])
def patient(id):
  print(id)
  patients = models.Patient.query.filter_by(id=id).all()
  r = [{
        "PatientID": p.id,
        "PatientAge": p.PatientAge,
        "GenesInMothersSide": p.GenesInMothersSide,
        "InheritedFromFather": p.InheritedFromFather,
        "MaternalGene": p.MaternalGene,
        "PaternalGene": p.PaternalGene,
        "BloodCellCount_mcL": p.BloodCellCount_mcL,
        "MothersAge": p.MothersAge,
        "FathersAge": p.FathersAge,
        "RespiratoryRate_breathsPerMin": p.RespiratoryRate_breathsPerMin,
        "HeartRate_ratesPermin": p.HeartRate_ratesPermin,
        "Gender": p.Gender,
        "BirthAsphyxia": p.BirthAsphyxia,
        "FolicAcidDetails_periConceptiona": p.FolicAcidDetails_periConceptiona,
        "HistoryOfSeriousMaternalIllness": p.HistoryOfSeriousMaternalIllness,
        "HistoryOfRadiationExposure_xRay": p.HistoryOfRadiationExposure_xRay,
        "HistoryOfSubstanceAbuse": p.HistoryOfSubstanceAbuse,
        "AssistedConception_IVF_ART": p.AssistedConception_IVF_ART,
        "HistoryOfAnomaliesInPreviousPregnancies": p.HistoryOfAnomaliesInPreviousPregnancies,
        "NumberOfPreviousAbortions": p.NumberOfPreviousAbortions,
        "BirthDefects": p.BirthDefects,
        "WhiteBloodCellCount_thousand_per_microliter": p.WhiteBloodCellCount_thousand_per_microliter,
        "BloodTestResult": p.BloodTestResult,
        "Symptom1": p.Symptom1,
        "Symptom2": p.Symptom2,
        "Symptom3": p.Symptom3,
        "Symptom4": p.Symptom4,
        "Symptom5": p.Symptom5,
        "DisorderSubclass": p.DisorderSubclass,
        "DisorderSubclassPredicted": p.DisorderSubclassPredicted
      } for p in patients
  ]
  print(r)
  response = make_response(jsonify({"patients": r[0]}))
  response.status_code = 200
  return response
  
@auth_bp.route('/api/roots-radar/list-patients', methods=['GET'])
def list_patients():
  patients = models.PATIENTS.query.all()
  r = [{
        "id": p.USER_ID,
        "email": models.Users.query.filter_by(id=p.USER_ID).first().email
        # "PatientID": p.id,
        # "PatientAge": p.PatientAge,
        # "GenesInMothersSide": p.GenesInMothersSide,
        # "InheritedFromFather": p.InheritedFromFather,
        # "MaternalGene": p.MaternalGene,
        # "PaternalGene": p.PaternalGene,
        # "BloodCellCount_mcL": p.BloodCellCount_mcL,
        # "MothersAge": p.MothersAge,
        # "FathersAge": p.FathersAge,
        # "RespiratoryRate_breathsPerMin": p.RespiratoryRate_breathsPerMin,
        # "HeartRate_ratesPermin": p.HeartRate_ratesPermin,
        # "Gender": p.Gender,
        # "BirthAsphyxia": p.BirthAsphyxia,
        # "FolicAcidDetails_periConceptiona": p.FolicAcidDetails_periConceptiona,
        # "HistoryOfSeriousMaternalIllness": p.HistoryOfSeriousMaternalIllness,
        # "HistoryOfRadiationExposure_xRay": p.HistoryOfRadiationExposure_xRay,
        # "HistoryOfSubstanceAbuse": p.HistoryOfSubstanceAbuse,
        # "AssistedConception_IVF_ART": p.AssistedConception_IVF_ART,
        # "HistoryOfAnomaliesInPreviousPregnancies": p.HistoryOfAnomaliesInPreviousPregnancies,
        # "NumberOfPreviousAbortions": p.NumberOfPreviousAbortions,
        # "BirthDefects": p.BirthDefects,
        # "WhiteBloodCellCount_thousand_per_microliter": p.WhiteBloodCellCount_thousand_per_microliter,
        # "BloodTestResult": p.BloodTestResult,
        # "Symptom1": p.Symptom1,
        # "Symptom2": p.Symptom2,
        # "Symptom3": p.Symptom3,
        # "Symptom4": p.Symptom4,
        # "Symptom5": p.Symptom5,
        # "DisorderSubclass": p.DisorderSubclass,
        # "DisorderSubclassPredicted": p.DisorderSubclassPredicted
      } for p in patients
  ]
  # print(r)
  response = make_response(jsonify({"patients": r}))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/number_of_patients_without_prediction', methods=['GET'])
def number_of_patients_without_prediction():
  patients = models.Patient.query.filter_by(DisorderSubclassPredicted=None)
  r = [{
        "PatientID": p.id,
        "PatientAge": p.PatientAge,
        "GenesInMothersSide": p.GenesInMothersSide,
        "InheritedFromFather": p.InheritedFromFather,
        "MaternalGene": p.MaternalGene,
        "PaternalGene": p.PaternalGene,
        "BloodCellCount_mcL": p.BloodCellCount_mcL,
        "MothersAge": p.MothersAge,
        "FathersAge": p.FathersAge,
        "RespiratoryRate_breathsPerMin": p.RespiratoryRate_breathsPerMin,
        "HeartRate_ratesPermin": p.HeartRate_ratesPermin,
        "Gender": p.Gender,
        "BirthAsphyxia": p.BirthAsphyxia,
        "FolicAcidDetails_periConceptiona": p.FolicAcidDetails_periConceptiona,
        "HistoryOfSeriousMaternalIllness": p.HistoryOfSeriousMaternalIllness,
        "HistoryOfRadiationExposure_xRay": p.HistoryOfRadiationExposure_xRay,
        "HistoryOfSubstanceAbuse": p.HistoryOfSubstanceAbuse,
        "AssistedConception_IVF_ART": p.AssistedConception_IVF_ART,
        "HistoryOfAnomaliesInPreviousPregnancies": p.HistoryOfAnomaliesInPreviousPregnancies,
        "NumberOfPreviousAbortions": p.NumberOfPreviousAbortions,
        "BirthDefects": p.BirthDefects,
        "WhiteBloodCellCount_thousand_per_microliter": p.WhiteBloodCellCount_thousand_per_microliter,
        "BloodTestResult": p.BloodTestResult,
        "Symptom1": p.Symptom1,
        "Symptom2": p.Symptom2,
        "Symptom3": p.Symptom3,
        "Symptom4": p.Symptom4,
        "Symptom5": p.Symptom5,
        "DisorderSubclass": p.DisorderSubclass,
        "DisorderSubclassPredicted": p.DisorderSubclassPredicted
      } for p in patients
  ]
  response = make_response(jsonify({"patients": r}))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/system-statistics', methods=['GET'])
def system_statistics():
  response = make_response(jsonify({
    "numberOfPatients": len(models.Users.query.all()),
    # "numberOfPatientsWithoutPrediction": len(models.Patient.query.filter_by(
    #   DisorderSubclassPredicted=None
    # ).all()),
  }))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/predict-unpredicted', methods=['POST'])
def predict_unpredicted():
  this_dir = os.path.dirname(__file__)
  M = joblib.load(f'{this_dir}/classifier-linear-svc-FROMDATABASE-inAPI-joblib-dump.joblib')

  targets = models.Patient.query.filter_by(DisorderSubclassPredicted=None).all()
  for targetPatient in targets:
    query = [
          targetPatient.PatientAge,
          targetPatient.GenesInMothersSide,
          targetPatient.InheritedFromFather,
          targetPatient.MaternalGene,
          targetPatient.PaternalGene,
          targetPatient.BloodCellCount_mcL,
          targetPatient.MothersAge,
          targetPatient.FathersAge,
          targetPatient.RespiratoryRate_breathsPerMin,
          targetPatient.HeartRate_ratesPermin,
          targetPatient.Gender,
          targetPatient.BirthAsphyxia,
          targetPatient.FolicAcidDetails_periConceptiona,
          targetPatient.HistoryOfSeriousMaternalIllness,
          targetPatient.HistoryOfRadiationExposure_xRay,
          targetPatient.HistoryOfSubstanceAbuse,
          targetPatient.AssistedConception_IVF_ART,
          targetPatient.HistoryOfAnomaliesInPreviousPregnancies,
          targetPatient.NumberOfPreviousAbortions,
          targetPatient.BirthDefects,
          targetPatient.WhiteBloodCellCount_thousand_per_microliter,
          targetPatient.BloodTestResult,
          targetPatient.Symptom1,
          targetPatient.Symptom2,
          targetPatient.Symptom3,
          targetPatient.Symptom4,
          targetPatient.Symptom5
        ]
    subclass = M.predict([query])[0]
    targetPatient.DisorderSubclassPredicted = subclass

  db.session.commit()
  return ("Success", 200)

@auth_bp.route('/api/roots-radar/patient/<id>/diagnoses', methods=['GET'])
def patient_diags(id):
  diagnoses = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=id).all()
  r = [{
      'ROW_ID': p.ROW_ID,
      'SUBJECT_ID': p.SUBJECT_ID,
      'SEQ_NUM': p.SEQ_NUM,
      'ICD9_CODE': p.ICD9_CODE,
      'text': models.D_ICD_DIAGNOSES.query.filter_by(ICD9_CODE=p.ICD9_CODE).first().SHORT_TITLE
      } for p in diagnoses
  ]
  response = make_response(jsonify({"diagnoses": r}))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/mimic-patient-details/<id>', methods=['GET'])
def mimic_patient_details(id): # this is the Users id
  if models.PATIENTS.query.filter_by(USER_ID=id).first().DESCENDENTS_CONSENT_FLAG == False:
    response = make_response(jsonify({
      "consent": "False"
    }))
    response.status_code = 200
    return response

  subject_id = models.PATIENTS.query.filter_by(USER_ID=id).first().SUBJECT_ID

  diagnoses = [{
      'ROW_ID': diag_record.ROW_ID,
      'SUBJECT_ID': diag_record.SUBJECT_ID,
      'SEQ_NUM': diag_record.SEQ_NUM,
      'ICD9_CODE': diag_record.ICD9_CODE,
      'SELF_REPORTED_FLAG': diag_record.SELF_REPORTED_FLAG,
      'SHORT_TITLE': models.D_ICD_DIAGNOSES.query.filter_by(ICD9_CODE=diag_record.ICD9_CODE).first().SHORT_TITLE if models.D_ICD_DIAGNOSES.query.filter_by(ICD9_CODE=diag_record.ICD9_CODE).first() else '',
      'LONG_TITLE': models.D_ICD_DIAGNOSES.query.filter_by(ICD9_CODE=diag_record.ICD9_CODE).first().LONG_TITLE if models.D_ICD_DIAGNOSES.query.filter_by(ICD9_CODE=diag_record.ICD9_CODE).first() else ''
      } for diag_record in models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=subject_id).all()
  ]

  chartevents = [{
      'ROW_ID': record.ROW_ID,
      'SUBJECT_ID': record.SUBJECT_ID,
      'ITEMID': record.ITEMID,
      'CHARTTIME': record.CHARTTIME,
      'STORETIME': record.STORETIME,
      'VALUE': record.VALUE,
      'VALUENUM': record.VALUENUM,
      'VALUEUOM': record.VALUEUOM
    } for record in models.CHARTEVENTS.query.filter_by(SUBJECT_ID=subject_id).all()
  ]

  labevents = [{
    'ROW_ID': record.ROW_ID,
    'SUBJECT_ID': record.SUBJECT_ID,
    'ITEMID': record.ITEMID,
    'CHARTTIME': record.CHARTTIME,
    'VALUE': record.VALUE,
    'VALUENUM': record.VALUENUM,
    'VALUEUOM': record.VALUEUOM,
    'FLAG': record.FLAG
  } for record in models.LABEVENTS.query.filter_by(SUBJECT_ID=subject_id).all()]

  noteevents = [{
    'ROW_ID': record.ROW_ID,
    'SUBJECT_ID': record.SUBJECT_ID,
    'CHARTDATE': record.CHARTDATE,
    'CHARTTIME': record.CHARTTIME,
    'STORETIME': record.STORETIME,
    'CATEGORY': record.CATEGORY,
    'DESCRIPTION': record.DESCRIPTION,
    'TEXT': record.TEXT
  } for record in models.NOTEEVENTS.query.filter_by(SUBJECT_ID=subject_id).all()]

  datetimeevents = [{
    'ROW_ID': record.ROW_ID,
    'SUBJECT_ID': record.SUBJECT_ID,
    'ITEMID': record.ITEMID,
    'CHARTTIME': record.CHARTTIME,
    'STORETIME': record.STORETIME,
    'VALUE': record.VALUE
  } for record in models.DATETIMEEVENTS.query.filter_by(SUBJECT_ID=subject_id).all()]

  response = make_response(jsonify({
    "consent": "True",
    "id": id,
    "diagnoses": diagnoses,
    "chartevents": chartevents,
    "labevents": labevents,
    "noteevents": noteevents,
    "datetimeevents": datetimeevents
  }))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/mimic-patient-parent-ids/<id>', methods=['GET'])
def mimic_patient_parents(id): # this is the Users id
  u = models.PATIENTS().query.filter_by(USER_ID=id).first()

  f = models.PATIENTS().query.filter_by(SUBJECT_ID=u.FATHER_SUBJECT_ID).first()
  m = models.PATIENTS().query.filter_by(SUBJECT_ID=u.MOTHER_SUBJECT_ID).first()
  
  if not f or not m:
    response = make_response()
    response.status_code = 204
    return response

  response = make_response(jsonify({
    "father": f.USER_ID,
    "mother": m.USER_ID
  }))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/diagnoses', methods=['GET'])
def mimic_diagnoses():
  diagnoses = [{
    'LONG_TITLE': diag_record.LONG_TITLE,
    'SHORT_TITLE': diag_record.SHORT_TITLE,
    'ICD9_CODE': diag_record.ICD9_CODE,
    } for diag_record in models.D_ICD_DIAGNOSES.query.all()
  ]
  response = make_response(jsonify({
    "diagnoses": diagnoses,
  }))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/self-diagnose', methods=['POST'])
def mimic_self_diagnose():
  query = request.get_json()['data']

  id = query['id']
  icd9_code = query['icd9Code']

  print(id)
  print(icd9_code)

  diag = models.DIAGNOSES_ICD(
      SUBJECT_ID = models.PATIENTS.query.filter_by(USER_ID=id).first().SUBJECT_ID,
      ICD9_CODE = icd9_code,
      SELF_REPORTED_FLAG = True,
    )
  db.session.add(diag)
  db.session.commit()

  response = make_response()
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/patient/<id>/consent', methods=['GET'])
def mimic_get_consent(id):
  consent = models.PATIENTS.query.filter_by(USER_ID=id).first().DESCENDENTS_CONSENT_FLAG
  response = make_response(jsonify({
    "isConsent": consent,
  }))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/mimic-patient-children/<id>', methods=['GET'])
def mimic_patient_children(id): # this is the Users id
  u = models.PATIENTS().query.filter_by(USER_ID=id).first()

  children = models.PATIENTS.query.filter(or_(models.PATIENTS.MOTHER_SUBJECT_ID==u.SUBJECT_ID, models.PATIENTS.FATHER_SUBJECT_ID==u.SUBJECT_ID)).all()

  if not children:
    response = make_response()
    response.status_code = 204
    return response

  response = make_response(jsonify([u.USER_ID for u in children]))
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/set-decendents-consent-flag/<id>/<flag>', methods=['POST'])
def patient_set_consent_flag(id, flag):  
  if flag != '1' and flag != '0':
    response = make_response()
    response.status_code = 400
    return response

  user = models.PATIENTS.query.filter_by(USER_ID=id).first()
  user.DESCENDENTS_CONSENT_FLAG = True if flag == '1' else False
  db.session.commit()

  response = make_response()
  response.status_code = 200
  return response

@auth_bp.route('/api/roots-radar/mimic-new-patient', methods=['POST'])
def mimic_new_patient():
  data = request.get_json()['patient']
  print(data)
  # Patient
  password = '$2b$12$SSc5Uur4mRZd5AdcOT057e9/5K7wQYNye0dx5oSuYpgyOrOfTWOQK'
  new_user_acc = models.Users(
      email = f'roots-radar-user{str(datetime.now())}@email.com',
      password = password,
      rootsRadarRole = 0
  )
  db.session.add(new_user_acc)
  db.session.commit()
  new_user_acc.email = f'roots-radar-user-{new_user_acc.id}@email.com'
  db.session.add(new_user_acc)
  db.session.commit()
  new_patient = models.PATIENTS(
    GENDER = data['sex'],
    DOB = datetime.now(),
    MOTHER_SUBJECT_ID = models.PATIENTS.query.filter_by(USER_ID=data['MotherSubjectID']).first().SUBJECT_ID,
    FATHER_SUBJECT_ID = models.PATIENTS.query.filter_by(USER_ID=data['FatherSubjectID']).first().SUBJECT_ID,
    USER_ID = new_user_acc.id
  )
  db.session.add(new_patient)
  db.session.commit()
  # Heart Rate
  HeartRate = models.CHARTEVENTS(
    SUBJECT_ID = new_patient.SUBJECT_ID,
    ITEMID = '220045', # 'Heart Rate'
    CHARTTIME = datetime.now(),
    STORETIME = datetime.now(),
    VALUE = data['HeartRate'],
    VALUENUM = None,
    VALUEUOM = 'rates/min',
  )
  db.session.add(HeartRate)
  # Respiratory Rate
  RespiratoryRate = models.CHARTEVENTS(
    SUBJECT_ID = new_patient.SUBJECT_ID,
    ITEMID = '220210', # 'Respiratory Rate'
    CHARTTIME = datetime.now(),
    STORETIME = datetime.now(),
    VALUE = data['RespiratoryRate'],
    VALUENUM = None,
    VALUEUOM = 'breaths/min',
  )
  db.session.add(RespiratoryRate)
  # Blood Cell Count
  bloodCellCount = models.LABEVENTS(
    SUBJECT_ID = new_patient.SUBJECT_ID,
    ITEMID = '99001', # Bloodcellcount
    CHARTTIME = datetime.now(),
    VALUE = str(data['bloodCellCount']),
    VALUENUM = data['bloodCellCount'],
    VALUEUOM = 'thousand/mcL',
    FLAG = None
  )
  db.session.add(bloodCellCount)
  # White Blood Cell Count
  whiteBloodCellCount = models.LABEVENTS(
    SUBJECT_ID = new_patient.SUBJECT_ID,
    ITEMID = '99002', # WhiteBloodcellcount
    CHARTTIME = datetime.now(),
    VALUE = str(data['whiteBloodCellCount']),
    VALUENUM = data['whiteBloodCellCount'],
    VALUEUOM = 'thousand/mcL',
    FLAG = None,
  )
  db.session.add(whiteBloodCellCount)
  # Blood Test Status
  BloodTestResult = models.LABEVENTS(
    SUBJECT_ID = new_patient.SUBJECT_ID,
    ITEMID = '43176', # 'Blood Out Lab'
    CHARTTIME = datetime.now(),
    VALUE = None,
    VALUENUM = None,
    VALUEUOM = None,
    FLAG = data['BloodTestResult'],
  )
  db.session.add(BloodTestResult)
  db.session.commit()

  (subclass, subclass_text) = make_mimic_prediction(new_patient.SUBJECT_ID)

  response = make_response(jsonify({
    "msg": "Patient Added",
    "id": new_patient.USER_ID,
    "subclass": subclass,
    "subclass_text": subclass_text,
  }))
  response.status_code = 200
  return response

def make_mimic_prediction(SUBJECT_ID):
  this_dir = os.path.dirname(__file__)
  M = joblib.load(f'{this_dir}/classifier-linear-svc-mimic-joblib-dump.joblib')
  data = []
  row = models.PATIENTS.query.filter_by(SUBJECT_ID=SUBJECT_ID).first()
  # for index, row in patients.iterrows():
  # make a big object for patient here
  FLATPATIENT = {
    'PatientAge': relativedelta(datetime.now(), row.DOB).years,
    'GenesInMothersSide': '', # DONE
    'InheritedFromFather': '', # DONE
    'MaternalGene': '', # DONE
    'PaternalGene': '', # DONE
    'BloodCellCount_mcL': '', # DONE
    'MothersAge': '', # DONE
    'FathersAge': '', # DONE
    'RespiratoryRate_breathsPerMin': '', # DONE
    'HeartRate_ratesPermin': '', # DONE
    'Gender': '', # DONE
    'BirthAsphyxia': '', # DONE
    'FolicAcidDetails_periConceptiona': '', # DONE 
    'HistoryOfSeriousMaternalIllness': '', # DONE
    'HistoryOfRadiationExposure_xRay': '', # DONE
    'HistoryOfSubstanceAbuse': '', # DONE
    'AssistedConception_IVF_ART': '', # DONE
    'HistoryOfAnomaliesInPreviousPregnancies': '', # DONE
    'NumberOfPreviousAbortions': '', # DONE
    'BirthDefects': '', # DONE
    'WhiteBloodCellCount_thousand_per_microliter': '', # DONE
    'BloodTestResult': '', # DONE
    'Symptom1': '', # DONE 
    'Symptom2': '', # DONE
    'Symptom3': '', # DONE
    'Symptom4': '', # DONE
    'Symptom5': '', # DONE
    # 'DisorderSubclass': '', # DONE
  }
  # if models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='X00012').first() != None:
  #     # disorder is tay sachs
  #     FLATPATIENT['DisorderSubclass'] = 5 ## "Tay-Sachs"
  #     pass    
  # elif models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='27709').first() != None:
  #     # disorder is Cystic fibrosis
  #     FLATPATIENT['DisorderSubclass'] = 0 ## "Cystic fibrosis"
  #     pass    
  # elif models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='27501').first() != None:
  #     # disorder is Heredit hemochromatosis
  #     FLATPATIENT['DisorderSubclass'] = 6 ## "Hemochromatosis"
  #     pass    
  # else:
  #     print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
  #     return -1

  mother = None
  father = None

  # Check mother exists
  mQ = models.PATIENTS.query.filter_by(USER_ID=row.MOTHER_SUBJECT_ID).all()
  if len(mQ) != 0:
      mother = mQ[0]
      x = datetime.strptime(str(row.DOB), '%Y-%m-%d')
      y = datetime.strptime(str(mother.DOB), '%Y-%m-%d')
      # print()
      # print(row.DOB)
      # print(mother.DOB)
      # break
      # Calculate Mothers age at birth
      FLATPATIENT['MothersAge'] = relativedelta(x, y).years
  else:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1


  # Check father exists
  fQ = models.PATIENTS.query.filter_by(USER_ID=row.FATHER_SUBJECT_ID).all()
  if len(fQ) != 0:
      father = fQ[0]
      # Calculate Fathers age at birth
      x = datetime.strptime(str(row.DOB), '%Y-%m-%d')
      y = datetime.strptime(str(father.DOB), '%Y-%m-%d')
      FLATPATIENT['FathersAge'] = relativedelta(x, y).years
  else:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1

  # Put Patient Gender in
  FLATPATIENT['Gender'] = 1 if row.GENDER == "M" else 0 # TODO: Check else = 2
  
  # Put patient bloodCellCount in
  cnt = models.LABEVENTS.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ITEMID='99001').first()
  if not cnt:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1
  FLATPATIENT['BloodCellCount_mcL'] = cnt.VALUENUM 
  # Put patient RespiratortyRate in
  cnt = models.CHARTEVENTS.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ITEMID='220210').first()
  if not cnt:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1
  FLATPATIENT['RespiratoryRate_breathsPerMin'] = 1 if cnt.VALUE == "Normal (30-60)" else 0
  # Put Patient HeartRate in
  cnt = models.CHARTEVENTS.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ITEMID='220045').first()
  if not cnt:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1
  FLATPATIENT['HeartRate_ratesPermin'] = 1 if cnt.VALUE == "Normal" else 0
  # Put Patient whiteBloodCellCount in
  cnt = models.LABEVENTS.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ITEMID='99002').first()
  if not cnt:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1
  FLATPATIENT['WhiteBloodCellCount_thousand_per_microliter'] = cnt.VALUENUM
  # Put Patient BloodTestResult in
  cnt = models.LABEVENTS.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ITEMID='43176').first()
  if not cnt:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1
  FLATPATIENT['BloodTestResult'] = 1 if cnt.FLAG == "slightly abnormal" else 0 if cnt.FLAG  == "normal" else 2 if cnt.FLAG =="inconclusive" else 3

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='X0004').first()
  FLATPATIENT['Symptom1'] = 1 if cnt else 0
  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='X0005').first()
  FLATPATIENT['Symptom2'] = 1 if cnt else 0
  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='X0006').first()
  FLATPATIENT['Symptom3'] = 1 if cnt else 0
  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='X0007').first()
  FLATPATIENT['Symptom4'] = 1 if cnt else 0
  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='X0008').first()
  FLATPATIENT['Symptom5'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='X0003').first()
  FLATPATIENT['BirthDefects'] = 1 if cnt else 0

  cnt = models.NOTEEVENTS.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, DESCRIPTION='Self assessed previous number of abortions').first()
  if not cnt:
    print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
    return -1
  FLATPATIENT['NumberOfPreviousAbortions'] = cnt.TEXT

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='7618').first()
  if not cnt: # try other value
    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='7619').first()
  FLATPATIENT['HistoryOfAnomaliesInPreviousPregnancies'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='V2385').first()
  FLATPATIENT['AssistedConception_IVF_ART'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='V113').first()
  if not cnt:
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='X0002').first()
  if not cnt:
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='V113').first()
  if not cnt:
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='X0002').first()
  FLATPATIENT['HistoryOfSubstanceAbuse'] = 1 if cnt else 0
  
  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='V153').first()
  if not cnt:
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='V153').first()
  FLATPATIENT['HistoryOfRadiationExposure_xRay'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='7602').first()
  FLATPATIENT['HistoryOfSeriousMaternalIllness'] = 1 if cnt else 0

  cnt = models.CHARTEVENTS.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ITEMID='5067').first()
  if not cnt:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1
  FLATPATIENT['FolicAcidDetails_periConceptiona'] = 1 if cnt.VALUE == 'Yes' else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='7685').first()
  if not cnt:
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='7686').first()
  if not cnt:
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='7689').first()
  FLATPATIENT['BirthAsphyxia'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='V189').first()
  FLATPATIENT['PaternalGene'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='V189').first()
  FLATPATIENT['MaternalGene'] = 1 if cnt else 0
  
  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='X0001').first() # TODO: if input has changed this needs to change
  FLATPATIENT['InheritedFromFather'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='X0001').first() # TODO: if input has changed this needs to change
  FLATPATIENT['GenesInMothersSide'] = 1 if cnt else 0

  data.append([
      FLATPATIENT['PatientAge'],
      FLATPATIENT['GenesInMothersSide'],
      FLATPATIENT['InheritedFromFather'],
      FLATPATIENT['MaternalGene'],
      FLATPATIENT['PaternalGene'],
      FLATPATIENT['BloodCellCount_mcL'],
      FLATPATIENT['MothersAge'],
      FLATPATIENT['FathersAge'],
      FLATPATIENT['RespiratoryRate_breathsPerMin'],
      FLATPATIENT['HeartRate_ratesPermin'],
      FLATPATIENT['Gender'],
      FLATPATIENT['BirthAsphyxia'],
      FLATPATIENT['FolicAcidDetails_periConceptiona'],
      FLATPATIENT['HistoryOfSeriousMaternalIllness'],
      FLATPATIENT['HistoryOfRadiationExposure_xRay'],
      FLATPATIENT['HistoryOfSubstanceAbuse'],
      FLATPATIENT['AssistedConception_IVF_ART'],
      FLATPATIENT['HistoryOfAnomaliesInPreviousPregnancies'],
      FLATPATIENT['NumberOfPreviousAbortions'],
      FLATPATIENT['BirthDefects'],
      FLATPATIENT['WhiteBloodCellCount_thousand_per_microliter'],
      FLATPATIENT['BloodTestResult'],
      FLATPATIENT['Symptom1'],
      FLATPATIENT['Symptom2'],
      FLATPATIENT['Symptom3'],
      FLATPATIENT['Symptom4'],
      FLATPATIENT['Symptom5'],
      # FLATPATIENT['DisorderSubclass'],
  ])

  data = [[float(item) for item in row] for row in data]
  flat_patient_record = data[0]
  print(flat_patient_record)
  subclass = M.predict([flat_patient_record])[0]
  print(subclass)

  # Add subclass to the record.
  # SUBCLASS is 5 0 or 6
  if subclass == 5.0:
    subclass_text = "Tay-Sachs"
  if subclass == 0.0:
    subclass_text = "Cystic fibrosis"
  if subclass == 6.0:
    subclass_text = "Hemochromatosis"

  if subclass == 5.0:
    print('subclass is 5')
    diag_subclass_ai = models.DIAGNOSES_ICD(
      SUBJECT_ID = SUBJECT_ID,
      ICD9_CODE = 'X0010',
    )
  elif subclass == 0.0:
    diag_subclass_ai = models.DIAGNOSES_ICD(
      SUBJECT_ID = SUBJECT_ID,
      ICD9_CODE = 'X0009',
    )
    print('subclass is 0')
  elif subclass == 6.0:
    diag_subclass_ai = models.DIAGNOSES_ICD(
      SUBJECT_ID = SUBJECT_ID,
      ICD9_CODE = 'X0011',
    )
    print('subclass is 6')
  db.session.add(diag_subclass_ai)
  db.session.commit()

  # class DIAGNOSES_ICD(db.Model):
  #     ROW_ID = db.Column(db.Integer, primary_key=True)
  #     SUBJECT_ID = db.Column(db.Integer, db.ForeignKey('patients.SUBJECT_ID'), nullable=False)
  #     # HADM_ID # Not required for demonstration
  #     SEQ_NUM = db.Column(db.Integer)
  #     ICD9_CODE = db.Column(db.String(10))
  #     SELF_REPORTED_FLAG = db.Column(db.Boolean, default=False)

  # New D_ICD_DIAGNOSES Predicted_Diseases 1 - 3
  # ai_predicted_cystic_fibrosis = models.D_ICD_DIAGNOSES(
  #     # ROW_ID = row['ROW_ID'],
  #     ICD9_CODE = 'X0009',
  #     SHORT_TITLE = 'ai_predicted_cystic_fibrosis',
  #     LONG_TITLE = 'ai_predicted_cystic_fibrosis'
  # )
  # db.session.add(ai_predicted_cystic_fibrosis)

  # ai_predicted_tay_sachs = models.D_ICD_DIAGNOSES(
  #     # ROW_ID = row['ROW_ID'],
  #     ICD9_CODE = 'X0010',
  #     SHORT_TITLE = 'ai_predicted_tay_sachs',
  #     LONG_TITLE = 'ai_predicted_tay_sachs'
  # )
  # db.session.add(ai_predicted_tay_sachs)

  # ai_predicted_hemochromatosis = models.D_ICD_DIAGNOSES(
  #     # ROW_ID = row['ROW_ID'],
  #     ICD9_CODE = 'X0011',
  #     SHORT_TITLE = 'ai_predicted_hemochromatosis',
  #     LONG_TITLE = 'ai_predicted_hemochromatosis'
  # )
  # db.session.add(ai_predicted_hemochromatosis)

  return (subclass, subclass_text)

@auth_bp.route('/api/roots-radar/mimic-manual-prediction/<SUBJECT_ID>', methods=['GET'])
def make_mimic_MANUAL_prediction(SUBJECT_ID):
  this_dir = os.path.dirname(__file__)
  M = joblib.load(f'{this_dir}/classifier-linear-svc-mimic-joblib-dump.joblib')
  data = []
  row = models.PATIENTS.query.filter_by(SUBJECT_ID=SUBJECT_ID).first()
  # for index, row in patients.iterrows():
  # make a big object for patient here
  FLATPATIENT = {
    'PatientAge': relativedelta(datetime.now(), row.DOB).years,
    'GenesInMothersSide': '', # DONE
    'InheritedFromFather': '', # DONE
    'MaternalGene': '', # DONE
    'PaternalGene': '', # DONE
    'BloodCellCount_mcL': '', # DONE
    'MothersAge': '', # DONE
    'FathersAge': '', # DONE
    'RespiratoryRate_breathsPerMin': '', # DONE
    'HeartRate_ratesPermin': '', # DONE
    'Gender': '', # DONE
    'BirthAsphyxia': '', # DONE
    'FolicAcidDetails_periConceptiona': '', # DONE 
    'HistoryOfSeriousMaternalIllness': '', # DONE
    'HistoryOfRadiationExposure_xRay': '', # DONE
    'HistoryOfSubstanceAbuse': '', # DONE
    'AssistedConception_IVF_ART': '', # DONE
    'HistoryOfAnomaliesInPreviousPregnancies': '', # DONE
    'NumberOfPreviousAbortions': '', # DONE
    'BirthDefects': '', # DONE
    'WhiteBloodCellCount_thousand_per_microliter': '', # DONE
    'BloodTestResult': '', # DONE
    'Symptom1': '', # DONE 
    'Symptom2': '', # DONE
    'Symptom3': '', # DONE
    'Symptom4': '', # DONE
    'Symptom5': '', # DONE
    # 'DisorderSubclass': '', # DONE
  }
  # if models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='X00012').first() != None:
  #     # disorder is tay sachs
  #     FLATPATIENT['DisorderSubclass'] = 5 ## "Tay-Sachs"
  #     pass    
  # elif models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='27709').first() != None:
  #     # disorder is Cystic fibrosis
  #     FLATPATIENT['DisorderSubclass'] = 0 ## "Cystic fibrosis"
  #     pass    
  # elif models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row['SUBJECT_ID'], ICD9_CODE='27501').first() != None:
  #     # disorder is Heredit hemochromatosis
  #     FLATPATIENT['DisorderSubclass'] = 6 ## "Hemochromatosis"
  #     pass    
  # else:
  #     print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
  #     return -1

  mother = None
  father = None

  # Check mother exists
  mQ = models.PATIENTS.query.filter_by(SUBJECT_ID=row.MOTHER_SUBJECT_ID).all()
  if len(mQ) != 0:
      mother = mQ[0]
      x = datetime.strptime(str(row.DOB), '%Y-%m-%d')
      y = datetime.strptime(str(mother.DOB), '%Y-%m-%d')
      # print()
      # print(row.DOB)
      # print(mother.DOB)
      # break
      # Calculate Mothers age at birth
      FLATPATIENT['MothersAge'] = relativedelta(x, y).years
  else:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1


  # Check father exists
  fQ = models.PATIENTS.query.filter_by(SUBJECT_ID=row.FATHER_SUBJECT_ID).all()
  if len(fQ) != 0:
      father = fQ[0]
      # Calculate Fathers age at birth
      x = datetime.strptime(str(row.DOB), '%Y-%m-%d')
      y = datetime.strptime(str(father.DOB), '%Y-%m-%d')
      FLATPATIENT['FathersAge'] = relativedelta(x, y).years
  else:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1

  # Put Patient Gender in
  FLATPATIENT['Gender'] = 1 if row.GENDER == "M" else 0 # TODO: Check else = 2
  
  # Put patient bloodCellCount in
  cnt = models.LABEVENTS.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ITEMID='99001').first()
  if not cnt:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1
  FLATPATIENT['BloodCellCount_mcL'] = cnt.VALUENUM 
  # Put patient RespiratortyRate in
  cnt = models.CHARTEVENTS.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ITEMID='220210').first()
  if not cnt:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1
  FLATPATIENT['RespiratoryRate_breathsPerMin'] = 1 if cnt.VALUE == "Normal (30-60)" else 0
  # Put Patient HeartRate in
  cnt = models.CHARTEVENTS.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ITEMID='220045').first()
  if not cnt:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1
  FLATPATIENT['HeartRate_ratesPermin'] = 1 if cnt.VALUE == "Normal" else 0
  # Put Patient whiteBloodCellCount in
  cnt = models.LABEVENTS.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ITEMID='99002').first()
  if not cnt:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1
  FLATPATIENT['WhiteBloodCellCount_thousand_per_microliter'] = cnt.VALUENUM
  # Put Patient BloodTestResult in
  cnt = models.LABEVENTS.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ITEMID='43176').first()
  if not cnt:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1
  FLATPATIENT['BloodTestResult'] = 1 if cnt.FLAG == "slightly abnormal" else 0 if cnt.FLAG  == "normal" else 2 if cnt.FLAG =="inconclusive" else 3

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='X0004').first()
  FLATPATIENT['Symptom1'] = 1 if cnt else 0
  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='X0005').first()
  FLATPATIENT['Symptom2'] = 1 if cnt else 0
  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='X0006').first()
  FLATPATIENT['Symptom3'] = 1 if cnt else 0
  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='X0007').first()
  FLATPATIENT['Symptom4'] = 1 if cnt else 0
  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='X0008').first()
  FLATPATIENT['Symptom5'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='X0003').first()
  FLATPATIENT['BirthDefects'] = 1 if cnt else 0

  cnt = models.NOTEEVENTS.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, DESCRIPTION='Self assessed previous number of abortions').first()
  if not cnt:
    print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
    return -1
  FLATPATIENT['NumberOfPreviousAbortions'] = cnt.TEXT

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='7618').first()
  if not cnt: # try other value
    cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='7619').first()
  FLATPATIENT['HistoryOfAnomaliesInPreviousPregnancies'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='V2385').first()
  FLATPATIENT['AssistedConception_IVF_ART'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='V113').first()
  if not cnt:
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='X0002').first()
  if not cnt:
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='V113').first()
  if not cnt:
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='X0002').first()
  FLATPATIENT['HistoryOfSubstanceAbuse'] = 1 if cnt else 0
  
  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='V153').first()
  if not cnt:
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='V153').first()
  FLATPATIENT['HistoryOfRadiationExposure_xRay'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='7602').first()
  FLATPATIENT['HistoryOfSeriousMaternalIllness'] = 1 if cnt else 0

  cnt = models.CHARTEVENTS.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ITEMID='5067').first()
  if not cnt:
      print("HIT A CONTINUE NOT VALID IN MAKE PREDICTION")
      return -1
  FLATPATIENT['FolicAcidDetails_periConceptiona'] = 1 if cnt.VALUE == 'Yes' else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='7685').first()
  if not cnt:
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='7686').first()
  if not cnt:
      cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=row.SUBJECT_ID, ICD9_CODE='7689').first()
  FLATPATIENT['BirthAsphyxia'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='V189').first()
  FLATPATIENT['PaternalGene'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='V189').first()
  FLATPATIENT['MaternalGene'] = 1 if cnt else 0
  
  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=father.SUBJECT_ID, ICD9_CODE='X0001').first() # TODO: if input has changed this needs to change
  FLATPATIENT['InheritedFromFather'] = 1 if cnt else 0

  cnt = models.DIAGNOSES_ICD.query.filter_by(SUBJECT_ID=mother.SUBJECT_ID, ICD9_CODE='X0001').first() # TODO: if input has changed this needs to change
  FLATPATIENT['GenesInMothersSide'] = 1 if cnt else 0

  data.append([
      FLATPATIENT['PatientAge'],
      FLATPATIENT['GenesInMothersSide'],
      FLATPATIENT['InheritedFromFather'],
      FLATPATIENT['MaternalGene'],
      FLATPATIENT['PaternalGene'],
      FLATPATIENT['BloodCellCount_mcL'],
      FLATPATIENT['MothersAge'],
      FLATPATIENT['FathersAge'],
      FLATPATIENT['RespiratoryRate_breathsPerMin'],
      FLATPATIENT['HeartRate_ratesPermin'],
      FLATPATIENT['Gender'],
      FLATPATIENT['BirthAsphyxia'],
      FLATPATIENT['FolicAcidDetails_periConceptiona'],
      FLATPATIENT['HistoryOfSeriousMaternalIllness'],
      FLATPATIENT['HistoryOfRadiationExposure_xRay'],
      FLATPATIENT['HistoryOfSubstanceAbuse'],
      FLATPATIENT['AssistedConception_IVF_ART'],
      FLATPATIENT['HistoryOfAnomaliesInPreviousPregnancies'],
      FLATPATIENT['NumberOfPreviousAbortions'],
      FLATPATIENT['BirthDefects'],
      FLATPATIENT['WhiteBloodCellCount_thousand_per_microliter'],
      FLATPATIENT['BloodTestResult'],
      FLATPATIENT['Symptom1'],
      FLATPATIENT['Symptom2'],
      FLATPATIENT['Symptom3'],
      FLATPATIENT['Symptom4'],
      FLATPATIENT['Symptom5'],
      # FLATPATIENT['DisorderSubclass'],
  ])

  data = [[float(item) for item in row] for row in data]
  flat_patient_record = data[0]
  print(flat_patient_record)
  subclass = M.predict([flat_patient_record])[0]
  print(subclass)

  # Add subclass to the record.
  # SUBCLASS is 5 0 or 6
  if subclass == 5.0:
    subclass_text = "Tay-Sachs"
  if subclass == 0.0:
    subclass_text = "Cystic fibrosis"
  if subclass == 6.0:
    subclass_text = "Hemochromatosis"

  if subclass == 5.0:
    print('subclass is 5')
    diag_subclass_ai = models.DIAGNOSES_ICD(
      SUBJECT_ID = new_patient.SUBJECT_ID,
      ICD9_CODE = 'X0010',
    )
  elif subclass == 0.0:
    diag_subclass_ai = models.DIAGNOSES_ICD(
      SUBJECT_ID = new_patient.SUBJECT_ID,
      ICD9_CODE = 'X0009',
    )
    print('subclass is 0')
  elif subclass == 6.0:
    diag_subclass_ai = models.DIAGNOSES_ICD(
      SUBJECT_ID = new_patient.SUBJECT_ID,
      ICD9_CODE = 'X0011',
    )
    print('subclass is 6')
  db.session.add(diag_subclass_ai)
  db.session.commit()

  # class DIAGNOSES_ICD(db.Model):
  #     ROW_ID = db.Column(db.Integer, primary_key=True)
  #     SUBJECT_ID = db.Column(db.Integer, db.ForeignKey('patients.SUBJECT_ID'), nullable=False)
  #     # HADM_ID # Not required for demonstration
  #     SEQ_NUM = db.Column(db.Integer)
  #     ICD9_CODE = db.Column(db.String(10))
  #     SELF_REPORTED_FLAG = db.Column(db.Boolean, default=False)

  # New D_ICD_DIAGNOSES Predicted_Diseases 1 - 3
  # ai_predicted_cystic_fibrosis = models.D_ICD_DIAGNOSES(
  #     # ROW_ID = row['ROW_ID'],
  #     ICD9_CODE = 'X0009',
  #     SHORT_TITLE = 'ai_predicted_cystic_fibrosis',
  #     LONG_TITLE = 'ai_predicted_cystic_fibrosis'
  # )
  # db.session.add(ai_predicted_cystic_fibrosis)

  # ai_predicted_tay_sachs = models.D_ICD_DIAGNOSES(
  #     # ROW_ID = row['ROW_ID'],
  #     ICD9_CODE = 'X0010',
  #     SHORT_TITLE = 'ai_predicted_tay_sachs',
  #     LONG_TITLE = 'ai_predicted_tay_sachs'
  # )
  # db.session.add(ai_predicted_tay_sachs)

  # ai_predicted_hemochromatosis = models.D_ICD_DIAGNOSES(
  #     # ROW_ID = row['ROW_ID'],
  #     ICD9_CODE = 'X0011',
  #     SHORT_TITLE = 'ai_predicted_hemochromatosis',
  #     LONG_TITLE = 'ai_predicted_hemochromatosis'
  # )
  # db.session.add(ai_predicted_hemochromatosis)

  response = make_response(jsonify({
    "msg": "Predicted",
    "subclass": subclass,
    "subclass_text": subclass_text,
  }))
  response.status_code = 200
  return response