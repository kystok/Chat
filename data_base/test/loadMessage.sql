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

-- Дамп структуры для процедура test.loadMessage
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `loadMessage`(
	IN `id_room` INT



)
    NO SQL
BEGIN
SELECT  `messages`.`id`,`messages`.`id_room`, `users`.`login` AS `sendFrom`,
 `messages`.`text`,
 `messages`.`date`,
  `imgs`.`path` AS img_path,
  `files`.`path` AS file_path
FROM `messages`
LEFT join `users` on  `messages`.`sendFrom` = `users`.`id`
LEFT join `imgs` on `imgs`.`id` = `messages`.`id_img`
LEFT join `files` on `files`.`id` = `messages`.`id_file`
WHERE `messages`.`id_room`=id_room
ORDER BY `messages`.`date`;

END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
