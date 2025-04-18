import XCTest
import Capacitor
import UserNotifications
@testable import App

class PushNotificationTests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }
    
    func testNotificationPermission() {
        // Vérifier que l'application demande la permission
        let notificationPermission = app.alerts["Notifications"]
        XCTAssertTrue(notificationPermission.exists, "La demande de permission pour les notifications devrait être affichée")
        
        // Vérifier les boutons de la boîte de dialogue
        let allowButton = notificationPermission.buttons["Autoriser"]
        let dontAllowButton = notificationPermission.buttons["Ne pas autoriser"]
        XCTAssertTrue(allowButton.exists, "Le bouton Autoriser devrait être présent")
        XCTAssertTrue(dontAllowButton.exists, "Le bouton Ne pas autoriser devrait être présent")
        
        // Accepter les notifications
        allowButton.tap()
        
        // Vérifier que la permission est accordée
        let expectation = XCTestExpectation(description: "Vérifier la permission de notification")
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            XCTAssertEqual(settings.authorizationStatus, .authorized, "La permission de notification devrait être accordée")
            XCTAssertTrue(settings.alertSetting == .enabled, "Les alertes devraient être activées")
            XCTAssertTrue(settings.badgeSetting == .enabled, "Les badges devraient être activés")
            XCTAssertTrue(settings.soundSetting == .enabled, "Les sons devraient être activés")
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 5)
    }
    
    func testNotificationReceipt() {
        // Simuler une notification
        let content = UNMutableNotificationContent()
        content.title = "Test Notification"
        content.body = "Ceci est un test de notification"
        content.userInfo = ["type": "test"]
        content.sound = UNNotificationSound.default
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: "test", content: content, trigger: trigger)
        
        let expectation = XCTestExpectation(description: "Recevoir une notification")
        UNUserNotificationCenter.current().add(request) { error in
            XCTAssertNil(error, "La notification devrait être planifiée sans erreur")
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 5)
        
        // Attendre que la notification soit reçue
        let notificationExpectation = XCTestExpectation(description: "Attendre la notification")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            notificationExpectation.fulfill()
        }
        wait(for: [notificationExpectation], timeout: 3)
        
        // Vérifier que la notification est affichée
        let notification = app.staticTexts["Test Notification"]
        XCTAssertTrue(notification.exists, "La notification devrait être affichée")
        
        // Vérifier le contenu de la notification
        let notificationBody = app.staticTexts["Ceci est un test de notification"]
        XCTAssertTrue(notificationBody.exists, "Le corps de la notification devrait être affiché")
    }
    
    func testNotificationAction() {
        // Simuler une notification avec une action
        let content = UNMutableNotificationContent()
        content.title = "Action Test"
        content.body = "Cliquez pour effectuer une action"
        content.userInfo = ["type": "action"]
        
        let action = UNNotificationAction(identifier: "test_action", title: "Test Action", options: [.foreground])
        let category = UNNotificationCategory(identifier: "test_category", actions: [action], intentIdentifiers: [], options: [])
        
        let expectation = XCTestExpectation(description: "Configurer la catégorie de notification")
        UNUserNotificationCenter.current().setNotificationCategories([category])
        expectation.fulfill()
        wait(for: [expectation], timeout: 5)
        
        // Simuler la notification
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: "action_test", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            XCTAssertNil(error, "La notification avec action devrait être planifiée sans erreur")
        }
        
        // Attendre que la notification soit reçue
        let notificationExpectation = XCTestExpectation(description: "Attendre la notification avec action")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            notificationExpectation.fulfill()
        }
        wait(for: [notificationExpectation], timeout: 3)
        
        // Vérifier que l'action est disponible
        let actionButton = app.buttons["Test Action"]
        XCTAssertTrue(actionButton.exists, "Le bouton d'action devrait être disponible")
        
        // Simuler le clic sur l'action
        actionButton.tap()
        
        // Vérifier que l'application a réagi à l'action
        let actionResult = app.staticTexts["Action effectuée"]
        XCTAssertTrue(actionResult.exists, "L'application devrait avoir réagi à l'action")
    }
    
    func testNotificationWithImage() {
        // Simuler une notification avec une image
        let content = UNMutableNotificationContent()
        content.title = "Notification avec image"
        content.body = "Cette notification contient une image"
        content.userInfo = ["type": "image"]
        
        // Ajouter une pièce jointe
        if let imageURL = Bundle.main.url(forResource: "test_image", withExtension: "png"),
           let attachment = try? UNNotificationAttachment(identifier: "image", url: imageURL, options: nil) {
            content.attachments = [attachment]
        }
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: "image_test", content: content, trigger: trigger)
        
        let expectation = XCTestExpectation(description: "Recevoir une notification avec image")
        UNUserNotificationCenter.current().add(request) { error in
            XCTAssertNil(error, "La notification avec image devrait être planifiée sans erreur")
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 5)
        
        // Attendre que la notification soit reçue
        let notificationExpectation = XCTestExpectation(description: "Attendre la notification avec image")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            notificationExpectation.fulfill()
        }
        wait(for: [notificationExpectation], timeout: 3)
        
        // Vérifier que la notification est affichée avec l'image
        let notification = app.staticTexts["Notification avec image"]
        XCTAssertTrue(notification.exists, "La notification avec image devrait être affichée")
        
        // Vérifier que l'image est présente
        let image = app.images["notification_image"]
        XCTAssertTrue(image.exists, "L'image de la notification devrait être affichée")
    }
} 