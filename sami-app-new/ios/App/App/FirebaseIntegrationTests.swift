import XCTest
import Capacitor
import Firebase
@testable import App

class FirebaseIntegrationTests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }
    
    func testFirebaseInitialization() {
        // Vérifier que Firebase est initialisé
        XCTAssertNotNil(FirebaseApp.app(), "Firebase devrait être initialisé")
        
        // Vérifier que les services Firebase sont disponibles
        XCTAssertNotNil(Firestore.firestore(), "Firestore devrait être disponible")
        XCTAssertNotNil(Auth.auth(), "Firebase Auth devrait être disponible")
        XCTAssertNotNil(Messaging.messaging(), "Firebase Messaging devrait être disponible")
        
        // Vérifier la configuration Firebase
        let options = FirebaseApp.app()?.options
        XCTAssertNotNil(options, "Les options Firebase devraient être disponibles")
        XCTAssertNotNil(options?.apiKey, "La clé API Firebase devrait être configurée")
        XCTAssertNotNil(options?.projectID, "L'ID du projet Firebase devrait être configuré")
        XCTAssertNotNil(options?.messagingSenderID, "L'ID de l'expéditeur de messagerie devrait être configuré")
    }
    
    func testFirestoreConnection() {
        let expectation = XCTestExpectation(description: "Test de connexion Firestore")
        
        // Tester une opération Firestore simple
        let db = Firestore.firestore()
        let testData = [
            "test_field": "test_value",
            "timestamp": FieldValue.serverTimestamp(),
            "array": ["item1", "item2"],
            "nested": ["key": "value"]
        ]
        
        db.collection("test").document("test_doc").setData(testData) { error in
            XCTAssertNil(error, "L'écriture dans Firestore devrait fonctionner sans erreur")
            
            // Lire les données pour vérifier
            db.collection("test").document("test_doc").getDocument { (document, error) in
                XCTAssertNil(error, "La lecture depuis Firestore devrait fonctionner sans erreur")
                XCTAssertNotNil(document, "Le document devrait exister")
                XCTAssertEqual(document?.data()?["test_field"] as? String, "test_value",
                             "Les données lues devraient correspondre aux données écrites")
                
                // Vérifier les autres champs
                let data = document?.data()
                XCTAssertNotNil(data?["timestamp"], "Le timestamp devrait être présent")
                XCTAssertEqual(data?["array"] as? [String], ["item1", "item2"],
                             "Le tableau devrait être correct")
                XCTAssertEqual((data?["nested"] as? [String: String])?["key"], "value",
                             "Les données imbriquées devraient être correctes")
                
                // Nettoyer
                db.collection("test").document("test_doc").delete { error in
                    XCTAssertNil(error, "La suppression devrait fonctionner sans erreur")
                    expectation.fulfill()
                }
            }
        }
        
        wait(for: [expectation], timeout: 10)
    }
    
    func testFirebaseAuth() {
        let expectation = XCTestExpectation(description: "Test d'authentification Firebase")
        
        // Tester l'authentification anonyme
        Auth.auth().signInAnonymously { (authResult, error) in
            XCTAssertNil(error, "L'authentification anonyme devrait fonctionner sans erreur")
            XCTAssertNotNil(authResult?.user, "Un utilisateur devrait être créé")
            
            // Vérifier que l'utilisateur est bien connecté
            let user = Auth.auth().currentUser
            XCTAssertNotNil(user, "Un utilisateur devrait être connecté")
            XCTAssertTrue(user?.isAnonymous ?? false, "L'utilisateur devrait être anonyme")
            
            // Vérifier les métadonnées de l'utilisateur
            XCTAssertNotNil(user?.metadata.creationDate, "La date de création devrait être présente")
            XCTAssertNotNil(user?.metadata.lastSignInDate, "La date de dernière connexion devrait être présente")
            
            // Déconnecter l'utilisateur
            do {
                try Auth.auth().signOut()
                XCTAssertNil(Auth.auth().currentUser, "L'utilisateur devrait être déconnecté")
            } catch {
                XCTFail("La déconnexion devrait fonctionner sans erreur")
            }
            
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 10)
    }
    
    func testFirebaseMessaging() {
        let expectation = XCTestExpectation(description: "Test de Firebase Messaging")
        
        // Vérifier que le token FCM peut être récupéré
        Messaging.messaging().token { token, error in
            XCTAssertNil(error, "La récupération du token FCM devrait fonctionner sans erreur")
            XCTAssertNotNil(token, "Un token FCM devrait être disponible")
            
            // Vérifier que le token est valide
            XCTAssertTrue(token?.count ?? 0 > 0, "Le token FCM devrait avoir une longueur valide")
            
            // Vérifier le format du token
            let tokenPattern = "^[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*$"
            let tokenRegex = try? NSRegularExpression(pattern: tokenPattern)
            let tokenRange = NSRange(location: 0, length: token?.count ?? 0)
            XCTAssertTrue(tokenRegex?.firstMatch(in: token ?? "", range: tokenRange) != nil,
                         "Le token FCM devrait avoir un format valide")
            
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 10)
    }
    
    func testFirebaseAnalytics() {
        // Vérifier que Analytics est disponible
        XCTAssertNotNil(Analytics.self, "Firebase Analytics devrait être disponible")
        
        // Enregistrer un événement
        Analytics.logEvent("test_event", parameters: [
            "test_param": "test_value",
            "numeric_param": 42
        ])
        
        // Vérifier que l'événement a été enregistré
        let expectation = XCTestExpectation(description: "Vérifier l'enregistrement de l'événement")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 5)
    }
    
    func testFirebasePerformance() {
        // Vérifier que Performance est disponible
        XCTAssertNotNil(Performance.self, "Firebase Performance devrait être disponible")
        
        // Créer une trace
        let trace = Performance.startTrace(name: "test_trace")
        XCTAssertNotNil(trace, "La trace devrait être créée")
        
        // Ajouter des attributs
        trace?.setValue(42, forAttribute: "test_attr")
        trace?.setValue("test_value", forAttribute: "string_attr")
        
        // Arrêter la trace
        trace?.stop()
        
        // Vérifier que la trace a été enregistrée
        let expectation = XCTestExpectation(description: "Vérifier l'enregistrement de la trace")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 5)
    }
} 