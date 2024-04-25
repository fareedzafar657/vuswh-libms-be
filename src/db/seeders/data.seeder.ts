import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Department } from '../entities/department.entity';
import { Designation } from '../entities/designation.entity';
import { Location } from '../entities/location.entity';
import { Category } from '../entities/category.entity';
import { Language } from '../entities/language.entity';
import { MaterialType } from '../entities/material_type.entity';
import { Publisher } from '../entities/publisher.entity';
import { Currency } from '../entities/currency.entity';
import { User } from '../entities/user.entity';

export default class UserSeeder implements Seeder {
  /**
   * Track seeder execution.
   *
   * Default: false
   */
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const roleRepository = dataSource.getRepository(Role);
    await roleRepository.insert([
      {
        name: 'admin',
      },
      {
        name: 'librarian',
      },
      {
        name: 'user',
      },
    ]);
    const departmentRepository = dataSource.getRepository(Department);
    await departmentRepository.insert([
      {
        name: 'Department of Economics',
      },
      {
        name: 'Department of English',
      },
      {
        name: 'Department of Mass Communication',
      },
      {
        name: 'Department of Psychology',
      },
      {
        name: 'Department of Sociology',
      },
      {
        name: 'Department of Computer Science and Information Technology',
      },
      {
        name: 'Department of Education',
      },
      {
        name: 'Department of Management Sciences',
      },
      {
        name: 'Department of Public Administration',
      },
      {
        name: 'Department of Bioinformatics & Computational Biology',
      },
      {
        name: 'Department of Biology',
      },
      {
        name: 'Department of Biotechnology',
      },
      {
        name: 'Department of Mathematics',
      },
      {
        name: 'Department of Molecular Biology',
      },
      {
        name: 'Department of Statistics',
      },
    ]);
    const designationRepository = dataSource.getRepository(Designation);
    await designationRepository.insert([
      {
        name: 'Professor',
      },
      {
        name: 'Associate Professor',
      },
      {
        name: 'Assistant Professor',
      },
      {
        name: 'Lecturer',
      },
      {
        name: 'eLecturer',
      },
    ]);
    const locationRepository = dataSource.getRepository(Location);
    await locationRepository.insert([
      {
        name: 'LRO-Office',
        address: 'Lawrence Road Lahore',
      },
      {
        name: 'Kala Shah Kaku',
        address: 'Lawrence Road Karachi',
      },
      {
        name: 'Rawalpindi Office',
        address: 'Lawrence Road Rawalpindi',
      },
    ]);
    const categoryRepository = dataSource.getRepository(Category);
    await categoryRepository.insert([
      {
        name: 'Book',
      },
      {
        name: 'Journal',
      },
      {
        name: 'Magazine',
      },
      {
        name: 'Novel',
      },
      {
        name: 'ebook',
      },
    ]);
    const languageRepository = dataSource.getRepository(Language);
    await languageRepository.insert([
      {
        name: 'Urdu',
      },
      {
        name: 'English',
      },
    ]);
    const materialTypeRepository = dataSource.getRepository(MaterialType);
    await materialTypeRepository.insert([
      {
        name: 'Hard Copy',
      },
      {
        name: 'PDF',
      },
    ]);
    const publisherRepository = dataSource.getRepository(Publisher);
    await publisherRepository.insert([
      {
        name: 'Dogar Publishers',
      },
      {
        name: 'HarperCollins',
      },
      {
        name: 'Simon & Schuster',
      },
      {
        name: 'Auraq Publications',
      },
      {
        name: 'Macmillan Publishers',
      },
    ]);
    const currencyRepository = dataSource.getRepository(Currency);
    await currencyRepository.insert([
      {
        name: 'USD',
      },
      {
        name: 'Euro',
      },
      {
        name: 'PKR',
      },
    ]);
    const RM1 = await dataSource
      .getRepository(Role)
      .findOne({ where: { name: 'admin' } });
    const RM2 = await dataSource
      .getRepository(Role)
      .findOne({ where: { name: 'librarian' } });
    const RM3 = await dataSource
      .getRepository(Role)
      .findOne({ where: { name: 'user' } });

    const DM1 = await dataSource.getRepository(Department).findOne({
      where: {
        name: 'Department of Computer Science and Information Technology',
      },
    });
    const DM2 = await dataSource.getRepository(Department).findOne({
      where: {
        name: 'Department of Sociology',
      },
    });
    const DM3 = await dataSource.getRepository(Department).findOne({
      where: {
        name: 'Department of Education',
      },
    });

    const DeM1 = await dataSource
      .getRepository(Designation)
      .findOne({ where: { name: 'Professor' } });
    const DeM2 = await dataSource
      .getRepository(Designation)
      .findOne({ where: { name: 'Associate Professor' } });
    const DeM3 = await dataSource
      .getRepository(Designation)
      .findOne({ where: { name: 'Assistant Professor' } });

    const userRepository = dataSource.getRepository(User);
    const UM1 = userRepository.create([
      {
        name: 'Sarfraz awan',
        username: 'sawan',
        email: 'sawan@vu.edu.pk',
        employee_id: '1256',
        tel_ext: '343',
        phone: '923334947594',
        password:
          '$2b$10$mfbPyP6w6GhpcFsRENptGOo4qEmuCgtlhBDY2IYYfa3NPcaQ2xbsO',
        is_active: true,
        is_validated: true,
        department: DM1,
        designation: DeM1,
        roles: [RM1, RM2],
      },
    ]);
    const UM2 = userRepository.create([
      {
        name: 'Fareed Zafar',
        username: 'fareed',
        email: 'fareed@vu.edu.pk',
        employee_id: '1276',
        tel_ext: '344',
        phone: '924334947594',
        password:
          '$2b$10$mfbPyP6w6GhpcFsRENptGOo4qEmuCgtlhBDY2IYYfa3NPcaQ2xbsO',
        is_active: true,
        is_validated: true,
        department: DM2,
        designation: DeM2,
        roles: [RM2],
      },
    ]);
    const UM3 = userRepository.create([
      {
        name: 'Muhammad Bilal',
        username: 'bilal',
        email: 'bilal@vu.edu.pk',
        employee_id: '5645',
        tel_ext: '346',
        phone: '924335947594',
        password:
          '$2b$10$mfbPyP6w6GhpcFsRENptGOo4qEmuCgtlhBDY2IYYfa3NPcaQ2xbsO',
        is_active: true,
        is_validated: true,
        department: DM3,
        designation: DeM3,
        roles: [RM3],
      },
    ]);

    await userRepository.save(UM1);
    await userRepository.save(UM2);
    await userRepository.save(UM3);
  }
}
