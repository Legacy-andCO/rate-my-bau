insert into branches (code, name, timezone) values ('main', 'Main Branch', 'Europe/Istanbul') on conflict do nothing;

insert into roles (name, description) values
('admin', 'Full access'),
('owner', 'Business owner'),
('manager', 'Manager role'),
('cashier', 'Cashier role'),
('inventory_staff', 'Inventory staff')
on conflict do nothing;

insert into permissions (code, description) values
('order.create','Create and complete orders'),
('order.refund','Refund existing orders'),
('order.void','Void/cancel orders'),
('menu.manage','Manage menu products'),
('inventory.manage','Manage inventory and stock movements'),
('reports.view','View analytics and reports'),
('users.manage','Manage employee users and roles'),
('settings.manage','Manage app settings')
on conflict do nothing;
