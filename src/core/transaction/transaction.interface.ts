export interface ITransactionManager {
  runInTransaction<T>(operation: () => Promise<T>): Promise<T>;
}
