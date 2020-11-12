import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    let newCategory: Category;

    const haveMoneyToBuy = async (): Promise<boolean | undefined> => {
      if (type === 'outcome') {
        const balance = await transactionsRepository.getBalance();
        return balance.total - value > 0;
      }
      return true;
    };

    if (!(await haveMoneyToBuy())) {
      throw new AppError('You are trying to use more money than you have', 400);
    }

    const findCategorySameTitle = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    if (findCategorySameTitle) {
      newCategory = findCategorySameTitle;
    } else {
      newCategory = await categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: newCategory.id,
      category: newCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
