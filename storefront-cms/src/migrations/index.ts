import * as migration_20261111_135643_initial from './20261111_135643_initial';

export const migrations = [
  {
    up: migration_20261111_135643_initial.up,
    down: migration_20261111_135643_initial.down,
    name: '20261111_135643_initial'
  },
];
