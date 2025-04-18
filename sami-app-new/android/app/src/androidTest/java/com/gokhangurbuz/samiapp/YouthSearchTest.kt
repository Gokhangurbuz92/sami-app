package com.gokhangurbuz.samiapp

import androidx.test.espresso.Espresso
import androidx.test.espresso.action.ViewActions
import androidx.test.espresso.matcher.ViewMatchers
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class YouthSearchTest {
    @get:Rule
    var activityRule = ActivityScenarioRule(MainActivity::class.java)

    @Test
    fun testYouthSearch() {
        // Attendre que l'application soit chargée
        Thread.sleep(2000)

        // Vérifier que le champ de recherche est présent
        Espresso.onView(ViewMatchers.withId(R.id.youth_search_input))
            .check(ViewMatchers.isDisplayed())

        // Saisir un terme de recherche
        Espresso.onView(ViewMatchers.withId(R.id.youth_search_input))
            .perform(ViewActions.typeText("John"))

        // Attendre les résultats
        Thread.sleep(1000)

        // Vérifier qu'un résultat est affiché
        Espresso.onView(ViewMatchers.withText("John Doe"))
            .check(ViewMatchers.isDisplayed())
    }

    @Test
    fun testDeleteYouth() {
        // Attendre que l'application soit chargée
        Thread.sleep(2000)

        // Rechercher un jeune
        Espresso.onView(ViewMatchers.withId(R.id.youth_search_input))
            .perform(ViewActions.typeText("John"))

        // Attendre les résultats
        Thread.sleep(1000)

        // Cliquer sur le bouton de suppression
        Espresso.onView(ViewMatchers.withId(R.id.delete_button))
            .perform(ViewActions.click())

        // Vérifier que la boîte de dialogue de confirmation s'affiche
        Espresso.onView(ViewMatchers.withText("Êtes-vous sûr de vouloir supprimer ce jeune ?"))
            .check(ViewMatchers.isDisplayed())

        // Confirmer la suppression
        Espresso.onView(ViewMatchers.withText("Supprimer"))
            .perform(ViewActions.click())

        // Vérifier que le jeune a été supprimé
        Thread.sleep(1000)
        Espresso.onView(ViewMatchers.withText("John Doe"))
            .check(ViewMatchers.doesNotExist())
    }
} 