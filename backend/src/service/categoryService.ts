import { categoryRepo } from '../repository/categoryRepository';

export const categoryService = {
    list: () => categoryRepo.findAll(),
    get: (id: number) => categoryRepo.findById(id),
    create: (name: string) => categoryRepo.create(name),
    update: (id: number, name: string) => categoryRepo.update(id, name),
    delete: (id: number) => categoryRepo.delete(id),
};