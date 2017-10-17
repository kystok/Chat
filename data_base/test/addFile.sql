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

-- Дамп структуры для процедура test.addFile
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `addFile`(
	IN `id_room` INT,
	IN `filePath` VARCHAR(250) charset UTF8,
	IN `sendFrom` VARCHAR(50) charset UTF8,
	IN `fileName` VARCHAR(255) charset UTF8




)
    SQL SECURITY INVOKER
BEGIN
SET @dat = now();
INSERT INTO `files` set `path`=filePath;
SELECT `id` INTO @id_user FROM `users` WHERE `users`.`login` = sendFrom limit 1;
SELECT `id` INTO @id_file FROM `files` WHERE `files`.`path` = filePath limit 1;
INSERT INTO `messages` SET 
	`sendFrom`=@id_user, `id_room`=id_room, 
	`date`= @dat,
	`text` = fileName, 
	`id_file`= @id_file;
SELECT id INTO @id from `messages` where
`date`=@dat and id_file=@id_file;
SELECT @id as ` id`, @dat as `date`;	 


END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
