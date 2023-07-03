import { initialState } from "../src/features/environments/state";
import environmentsReducer from "../src/features/environments/state/environments.slice";
import * as actions from "../src/features/environments/state/environments.actions"

describe('environments reducer', () => {

    const STATE = initialState;

    describe('load environments', () => {

        it('should set the loading state to loading', () => {

            // Arrange
            const action = actions.loadEnvironments.pending(null, null, null);

            // Act  
            const newState = environmentsReducer(STATE, action)

            // Assert
            expect(newState.status).toEqual("loading");


        })

    })


});