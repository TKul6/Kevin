import React, { useState } from 'react';

import { useAppSelector, useAppDispatch } from '../../app/hooks';

import styles from './Counter.module.css';
import { loadEnvironments } from './environmentsSlice';

export function EnvironmentsTree() {
  const environments = useAppSelector((state) => state.environments.environments);
  const dispatch = useAppDispatch();

  return (
    <div>
      Environments Tree: 
      <div className={styles.row}>
        <div> {JSON.stringify(environments)}</div>
      </div>
      <div className={styles.row}>
        
        <button
          className={styles.asyncButton}
          onClick={() => dispatch(loadEnvironments())}
        >
          Load environments
        </button>
        
      </div>
    </div>
  );
}
