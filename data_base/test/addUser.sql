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

-- Дамп структуры для функция test.addUser
DELIMITER //
CREATE DEFINER=`root`@`localhost` FUNCTION `addUser`(`login` CHAR(10) CHARSET utf8, `pass` CHAR(128) CHARSET utf8, `firstName` CHAR(20) CHARSET utf8, `lastName` CHAR(20) CHARSET utf8) RETURNS int(11)
    NO SQL
    SQL SECURITY INVOKER
    COMMENT '0 - Пользователь уже существует; 1 - успешное добавление'
BEGIN

SELECT COUNT(id) FROM `users` 
                    WHERE        	
                        `users`.`login` = login AND
                        `users`.`password` = pass INTO @result;
IF @result = 0 THEN                                 
    INSERT INTO `users`
        SET 
            `users`.`login` = login,
            `users`.`password` = pass,
            `users`.`firstName` = firstName,
            `users`.`lastName` = lastName,
            `users`.`date` = now(); 
    RETURN true;
ELSE 
	RETURN false;
END IF;  
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
