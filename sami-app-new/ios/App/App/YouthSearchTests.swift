import XCTest
import Capacitor
@testable import App

class YouthSearchTests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }
    
    func testSearchInputExists() {
        let searchInput = app.textFields["youth_search_input"]
        XCTAssertTrue(searchInput.exists, "Le champ de recherche devrait être présent")
        XCTAssertEqual(searchInput.placeholderValue, "Rechercher un jeune...", "Le placeholder devrait être correct")
    }
    
    func testSearchFunctionality() {
        let searchInput = app.textFields["youth_search_input"]
        searchInput.tap()
        searchInput.typeText("John")
        
        // Attendre les résultats avec un délai plus long
        let expectation = XCTestExpectation(description: "Attendre les résultats de recherche")
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 5)
        
        // Vérifier qu'un résultat est affiché
        let result = app.staticTexts["John Doe"]
        XCTAssertTrue(result.exists, "Le résultat de recherche devrait être affiché")
        
        // Vérifier les détails du résultat
        let details = app.staticTexts["Détails du jeune"]
        XCTAssertTrue(details.exists, "Les détails du jeune devraient être affichés")
    }
    
    func testSearchNoResults() {
        let searchInput = app.textFields["youth_search_input"]
        searchInput.tap()
        searchInput.typeText("AucunRésultat")
        
        // Attendre les résultats
        let expectation = XCTestExpectation(description: "Attendre l'absence de résultats")
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 5)
        
        // Vérifier le message d'absence de résultats
        let noResults = app.staticTexts["Aucun résultat trouvé"]
        XCTAssertTrue(noResults.exists, "Le message d'absence de résultats devrait être affiché")
    }
    
    func testDeleteFunctionality() {
        // Rechercher un jeune
        let searchInput = app.textFields["youth_search_input"]
        searchInput.tap()
        searchInput.typeText("John")
        
        // Attendre les résultats
        let expectation = XCTestExpectation(description: "Attendre les résultats de recherche")
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 5)
        
        // Cliquer sur le bouton de suppression
        let deleteButton = app.buttons["delete_button"]
        XCTAssertTrue(deleteButton.exists, "Le bouton de suppression devrait être présent")
        deleteButton.tap()
        
        // Vérifier la boîte de dialogue de confirmation
        let confirmDialog = app.staticTexts["Êtes-vous sûr de vouloir supprimer ce jeune ?"]
        XCTAssertTrue(confirmDialog.exists, "La boîte de dialogue de confirmation devrait être affichée")
        
        // Vérifier les boutons de la boîte de dialogue
        let cancelButton = app.buttons["Annuler"]
        let confirmButton = app.buttons["Supprimer"]
        XCTAssertTrue(cancelButton.exists, "Le bouton Annuler devrait être présent")
        XCTAssertTrue(confirmButton.exists, "Le bouton Supprimer devrait être présent")
        
        // Confirmer la suppression
        confirmButton.tap()
        
        // Attendre la suppression
        let deleteExpectation = XCTestExpectation(description: "Attendre la suppression")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            deleteExpectation.fulfill()
        }
        wait(for: [deleteExpectation], timeout: 3)
        
        // Vérifier que le jeune a été supprimé
        let result = app.staticTexts["John Doe"]
        XCTAssertFalse(result.exists, "Le jeune devrait être supprimé")
    }
    
    func testSearchWithSpecialCharacters() {
        let searchInput = app.textFields["youth_search_input"]
        searchInput.tap()
        searchInput.typeText("Jean-Philippe")
        
        // Attendre les résultats
        let expectation = XCTestExpectation(description: "Attendre les résultats avec caractères spéciaux")
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 5)
        
        // Vérifier qu'un résultat est affiché
        let result = app.staticTexts["Jean-Philippe Martin"]
        XCTAssertTrue(result.exists, "Le résultat avec caractères spéciaux devrait être affiché")
    }
} 