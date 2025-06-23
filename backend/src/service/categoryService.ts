import { categoryRepository} from '../repository/categoryRepository';

export const categoryService = {
    list: () => categoryRepository.findAll(),
    get: (id: number) => categoryRepository.findById(id),
    create: (name: string) => categoryRepository.create(name),
    update: (id: number, name: string) => categoryRepository.update(id, name),
    delete: (id: number) => categoryRepository.delete(id),
};