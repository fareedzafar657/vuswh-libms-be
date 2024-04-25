-- Roles Queries

INSERT INTO roles(id,name)
VALUES(UUID(),"admin"),
(UUID(),"user"),
(UUID(),"librarian");


-- Permission query start from here


INSERT INTO `permissions`(`id`, `name`, `parentId`) VALUES (UUID(),'users-manage',null),
(UUID(),'roles-manage',null),
(UUID(),'permissions-manage',null);




INSERT INTO `permissions`(`id`, `name`, `parentId`) 
VALUES (UUID(),'users-add', (SELECT id FROM `permissions` as p where name='users-manage')),
(UUID(),'users-edit', (SELECT id FROM `permissions` as p where name='users-manage')),
(UUID(),'users-delete', (SELECT id FROM `permissions` as p where name='users-manage'));


INSERT INTO `permissions`(`id`, `name`, `parentId`) 
VALUES (UUID(),'roles-add', (SELECT id FROM `permissions` as p where name='roles-manage')),
(UUID(),'roles-edit', (SELECT id FROM `permissions` as p where name='roles-manage')),
(UUID(),'roles-delete', (SELECT id FROM `permissions` as p where name='roles-manage'));


INSERT INTO `permissions`(`id`, `name`, `parentId`) 
VALUES (UUID(),'permissions-add', (SELECT id FROM `permissions` as p where name='permissions-manage')),
(UUID(),'permissions-edit', (SELECT id FROM `permissions` as p where name='permissions-manage')),
(UUID(),'permissions-delete', (SELECT id FROM `permissions` as p where name='permissions-manage'));


-- Permission query ends here


-- Department Queries

INSERT INTO departments(id,name)
VALUES(UUID(),"Department of Economics"),
(UUID(),"Department of English"),
(UUID(), "Department of Mass Communication"),
(UUID(), "Department of Psychology"),
(UUID(), "Department of Sociology"),
(UUID(), "Department of Computer Science and Information Technology"),
(UUID(), "Department of Education"),
(UUID(), "Department of Management Sciences"),
(UUID(), "Department of Public Administration"),
(UUID(), "Department of Bioinformatics & Computational Biology"),
(UUID(), "Department of Biology"),
(UUID(), "Department of Biotechnology"),
(UUID(), "Department of Mathematics"),
(UUID(), "Department of Molecular Biology"),
(UUID(), "Department of Statistics");


-- Designation Queries

INSERT INTO designations(id, name)
VALUES(UUID(),"Professor"),
(UUID(),"Associate Professor"),
(UUID(),"Assistant Professor"),
(UUID(),"Lecturer"),
(UUID(),"eLecturer");


-- Location Queries

INSERT INTO locations (id,name,address)
VALUES
(UUID(),"LRO-Office","Lawrence Road Lahore"),
(UUID(),"Kala Shah Kaku", "Lawrence Road Karachi"),
(UUID(),"Rawalpindi Office", "Lawrence Road Rawalpindi");


-- Categories Queries

INSERT INTO categories (id,name)
VALUES
(UUID(),"Book"),
(UUID(),"Journal"),
(UUID(),"Magazine"),
(UUID(),"Novel"),
(UUID(),"ebook");


-- Languages Queries

INSERT INTO languages (id,name)
VALUES
(UUID(),"Urdu"),
(UUID(),"English"),
(UUID(),"Punjabi"),
(UUID(),"Farsi"),
(UUID(),"Pushto");


-- Material_Type Queries

INSERT INTO material_types (id,name)
VALUES
(UUID(),"Hard Copy"),
(UUID(),"PDF");


-- Publishers Queries

INSERT INTO publishers (id,name)
VALUES
(UUID(),"Dogar Publishers"),
(UUID(),"HarperCollins"),
(UUID(),"Simon & Schuster"),
(UUID(),"Auraq Publications"),
(UUID(),"Macmillan Publishers");

-- Currencies Queries

INSERT INTO currencies (id,name)
VALUES
(UUID(),"USD"),
(UUID(),"Euro"),
(UUID(),"PKR");

-- User Queries

INSERT INTO users (id ,name, username, email,employeeId, phone ,password , is_active, is_validated ,created_at,departmentId,designationId)
VALUES (uuid(),"Sarfraz awan","sawan","sawan@vu.edu.pk","1256","923334947594","$2b$10$mfbPyP6w6GhpcFsRENptGOo4qEmuCgtlhBDY2IYYfa3NPcaQ2xbsO",true,true,curdate(),
(SELECT id FROM `departments` WHERE NAME = 'Department of Computer Science and Information Technology'),
(SELECT id FROM `designations` WHERE NAME = 'Professor'));

INSERT INTO users (id ,name, username, email,employeeId, phone ,password , is_active, is_validated ,created_at,departmentId,designationId)
VALUES (uuid(),"Fareed Zafar","fareed","fareedzafar657@vu.edu.pk","1276","924334947594","$2b$10$mfbPyP6w6GhpcFsRENptGOo4qEmuCgtlhBDY2IYYfa3NPcaQ2xbsO",true,true,curdate(),
(SELECT id FROM `departments` WHERE NAME = 'Department of Computer Science and Information Technology'),
(SELECT id FROM `designations` WHERE NAME = 'Professor'));


INSERT INTO users (id ,name, username, email,employeeId, phone ,password , is_active, is_validated ,created_at,departmentId,designationId)
VALUES (uuid(),"Muhammad Bilal","bilal","bilal@vu.edu.pk","5645","924335947594","$2b$10$mfbPyP6w6GhpcFsRENptGOo4qEmuCgtlhBDY2IYYfa3NPcaQ2xbsO",true,true,curdate(),
(SELECT id FROM `departments` WHERE NAME = 'Department of Computer Science and Information Technology'),
(SELECT id FROM `designations` WHERE NAME = 'Professor'));

-- users_roles_roles

INSERT INTO users_roles_roles(usersid, rolesid)
VALUES ((SELECT id from users where username = 'sawan'),(SELECT id FROM roles where name = 'admin'));

INSERT INTO users_roles_roles(usersid, rolesid)
VALUES ((SELECT id from users where username = 'fareed'),(SELECT id FROM roles where name = 'user'));

INSERT INTO users_roles_roles(usersid, rolesid)
VALUES ((SELECT id from users where username = 'bilal'),(SELECT id FROM roles where name = 'librarian'));


-- Emptying tables data

DELETE
FROM
    vswh_lms.permissions_users_users;
DELETE
FROM
    vswh_lms.users_roles_roles;
DELETE
FROM
    vswh_lms.permissions_roles_roles;
DELETE
FROM
    "users";
DELETE
FROM
    `books`;
DELETE
FROM
    `categories`;
DELETE
FROM
    `departments`;
DELETE
FROM
    `designations`;
DELETE
FROM
    `languages`;
DELETE
FROM
    `locations`;
DELETE
FROM
    `material_types`;
DELETE
FROM
    `permissions`;
DELETE
FROM
    `publishers`;
DELETE
FROM
    `roles`;
DELETE
FROM
    `roles`;