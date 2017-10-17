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

-- Дамп структуры для процедура test.addRoom
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `addRoom`(IN `userr` CHAR(20) CHARSET utf8, IN `name` CHAR(30) CHARSET utf8, IN `datet` DATETIME)
    NO SQL
BEGIN
SET AUTOCOMMIT = 0;
START TRANSACTION;
SELECT count(`id`) FROM `rooms` WHERE `rooms`.`date` = datet AND `rooms`.`room_name` = name INTO @count_id;

IF (@count_id < 1) THEN 
INSERT INTO `rooms` SET `rooms`.`date` = datet, `rooms`.`room_name` = name; 
END IF;

SELECT `id` FROM `rooms` WHERE `rooms`.`date` = datet INTO @id_room;
SELECT `id` FROM `users` WHERE `users`.`login` = userr INTO @id_user;
INSERT INTO `room` SET `room`.`id_user` = @id_user, `room`.`id_room` = @id_room;

COMMIT;
SET AUTOCOMMIT = 1;
end//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
