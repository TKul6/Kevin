import {
  EnvironmentsState,
  initialState,
} from '../src/features/environments/state';
import environmentsReducer from '../src/features/environments/state/environments.slice';
import * as actions from '../src/features/environments/state/environments.actions';

describe('environments reducer', () => {
  let STATE: EnvironmentsState;

  beforeEach(() => {
    STATE = { ...initialState };
  });

  describe('load environments', () => {
    it('should handle loading environments', () => {
      STATE.environments = [
        {
          name: 'root',
          id: 'root',
          parentEnvironmentId: null,
        },
      ];

      // Arrange
      const action = actions.loadEnvironments.pending(null, null, null);

      // Act
      const newState = environmentsReducer(STATE, action);

      // Assert
      expect(newState.status).toEqual('loading');
      expect(newState.environments).toEqual([]);
    });

    it('should handle loaded state', () => {
      const environments = [
        {
          name: 'root',
          id: 'root',
          parentEnvironmentId: null,
        },
      ];

      // Arrange
      const action = actions.loadEnvironments.fulfilled(
        environments,
        null,
        null
      );

      // Act
      const newState = environmentsReducer(STATE, action);

      // Assert
      expect(newState.status).toEqual('loaded');
      expect(newState.environments).toEqual(environments);
    });

    it('should handle failures from the server', () => {
      // Arrange
      const action = actions.loadEnvironments.rejected(null, null, null);

      // Act
      const newState = environmentsReducer(STATE, action);

      // Assert
      expect(newState.status).toEqual('failed');
      expect(newState.environments).toEqual([]);
    });

    it('should handle no environments exists', () => {
      const environments = [];

      // Arrange
      const action = actions.loadEnvironments.fulfilled(
        environments,
        null,
        null
      );

      // Act
      const newState = environmentsReducer(STATE, action);

      // Assert
      expect(newState.status).toEqual('loaded');
      expect(newState.environments).toEqual(environments);
    });
  });
});
