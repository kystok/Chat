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

-- Дамп структуры для процедура test.addMessages
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `addMessages`(
	IN `sendFrom` CHAR(20) CHARSET utf8,
	IN `id_room` INT(11),
	IN `textMessage` MEDIUMTEXT CHARSET utf8





)
    NO SQL
BEGIN
SELECT id INTO @id_user FROM `users` WHERE `users`.`login` = sendFrom limit 1;
SET @date = now(6);

INSERT INTO `messages` 
	SET
    	`messages`.`id_room` = id_room,
        `messages`.`text` = textMessage, 
        `messages`.`date` = @date,
        `messages`.`sendFrom` = @id_user;
        
SELECT COUNT(id) INTO @res from `messages` where `messages`.`sendFrom` = @id_user AND `messages`.`date` = @date;
SELECT id INTO @id_message from `messages` 
where `messages`.`sendFrom` = @id_user 
AND `messages`.`date` = @date 
AND `messages`.`text` = textMessage;

IF (@res>0) THEN 
select @date as `date`, @id_message as `id_message`;
END IF;
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
