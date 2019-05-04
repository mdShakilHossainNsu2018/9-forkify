import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView'
import {elements, clearLoader, renderLoader} from "./views/base";
import Recipe from './models/Recipe';

/**Global state of the app
 * -search object
 * - current recipe object
 * - Shopping list object
 * - Linked recipes
 * */
const state = {};

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResList();
        renderLoader(elements.searchRes);

        try {
            // 4) Search for recipes
            await state.search.getResults();

            // 5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something wrong with the search...');
            clearLoader();
        }
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', evt => {
    const btn = evt.target.closest('.btn-inline');
    if (btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResList();
        searchView.renderResults(state.search.result, goToPage);
    }
});

//Recipe controller

const controlRecipe = async () =>{
  const id = window.location.hash.replace('#', '');
  // console.log(id);

  if (id){
    //  prepare the loader
      recipeView.clearRecipe();

      renderLoader(elements.recipe);

      //highlighted

      if (state.search) searchView.highlightSelected(id);
    //Create a new Recipe obj
      state.recipe = new Recipe(id);

    //getRecipe()
      try {

          await state.recipe.getRecipe();

          state.recipe.parseIngredients();

          //calculate time and serving
          state.recipe.calcTime();
          state.recipe.calcServings();
      }catch (e) {
          alert("error in processing recipe");
      }


    //render Recipe
    clearLoader();

      recipeView.renderRecipe(state.recipe);
  }
};
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

elements.recipe.addEventListener('click', evt => {
   if (evt.target.matches('.btn-decrease, .btn-decrease *')){
       if (state.recipe.servings> 1){
           state.recipe.updateServings('dec');
           recipeView.updateServingsIngredients(state.recipe);
       }
   }  else if (evt.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServings('inc');
       recipeView.updateServingsIngredients(state.recipe);
   }
   console.log(state.recipe);
});