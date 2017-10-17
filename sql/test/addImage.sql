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

-- Дамп структуры для процедура test.addImage
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `addImage`(
	IN `id_room` INT,
	IN `imagePath` CHAR(250) CHARSET utf8,
	IN `sendFrom` CHAR(20) CHARSET utf8




)
    SQL SECURITY INVOKER
BEGIN
SET @dat = now();
INSERT INTO `imgs` set `path`=imagePath;
SELECT `id` INTO @id_user FROM `users` WHERE `users`.`login` = sendFrom limit 1;
SELECT `id` INTO @id_img FROM `imgs` WHERE `path`=imagePath LIMIT 1;
INSERT INTO `messages` SET 	
	`sendFrom`= @id_user,`id_room`=id_room, `date`=@dat, `id_img`=@id_img;

SELECT id INTO @id_message from `messages` where
`date`=@dat and `id_img`=@id_img;
SELECT @id_message as `id_message`, @dat as `date`;  
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
