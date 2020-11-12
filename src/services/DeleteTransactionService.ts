import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const findTransaction = await transactionsRepository.findOne(id);

    if (!findTransaction) {
      throw new AppError('Transaction not found', 404);
    }

    await transactionsRepository.remove(findTransaction);
  }
}

export default DeleteTransactionService;
