-- --------------------------------------------------------
-- Хост:                         127.0.0.1
-- Версия сервера:               5.7.19-0ubuntu0.16.04.1 - (Ubuntu)
-- Операционная система:         Linux
-- HeidiSQL Версия:              9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Дамп структуры для процедура test.addConversation
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `addConversation`(
	IN `name` CHAR(150)charset utf8,
	IN `userName` CHAR(50)charset UTF8








)
BEGIN
select COUNT(id) INTO @c FROM `rooms` WHERE `room_name`=name;
if (@c<1) then insert into `rooms` set `room_name`= name, `date`=now();
end if;

select `id` INTO @id_room FROM `rooms` WHERE `room_name`=name LIMIT 1;
select `id` INTO @id_user FROM `users` WHERE `login` = userName LIMIT 1;
insert into `room` set `id_room`=@id_room, `id_user` = @id_user;

END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
