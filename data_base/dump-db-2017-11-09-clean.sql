-- --------------------------------------------------------
-- Хост:                         127.0.0.1
-- Версия сервера:               5.7.20-0ubuntu0.16.04.1 - (Ubuntu)
-- Операционная система:         Linux
-- HeidiSQL Версия:              9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Дамп структуры базы данных test
CREATE DATABASE IF NOT EXISTS `test` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;
USE `test`;

-- Дамп структуры для таблица test.access
CREATE TABLE IF NOT EXISTS `access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session` char(150) CHARACTER SET utf8 NOT NULL,
  `user` char(50) CHARACTER SET utf8 NOT NULL,
  `dateTime` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=cp850;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица test.files
CREATE TABLE IF NOT EXISTS `files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path` char(255) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=cp850;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица test.friendList
CREATE TABLE IF NOT EXISTS `friendList` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` int(11) NOT NULL,
  `friend` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=cp850;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица test.imgs
CREATE TABLE IF NOT EXISTS `imgs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path` char(255) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=456 DEFAULT CHARSET=cp850;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица test.log
CREATE TABLE IF NOT EXISTS `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `act` text CHARACTER SET utf8,
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=cp850;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица test.messages
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_room` int(11) NOT NULL,
  `sendFrom` int(11) DEFAULT NULL,
  `text` mediumtext CHARACTER SET utf8,
  `id_img` int(11) DEFAULT NULL,
  `date` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `id_file` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_room` (`id_room`),
  KEY `sendFrom` (`sendFrom`),
  KEY `id_img` (`id_img`),
  KEY `files` (`id_file`)
) ENGINE=InnoDB AUTO_INCREMENT=1227 DEFAULT CHARSET=cp850;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица test.room
CREATE TABLE IF NOT EXISTS `room` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_room` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_room` (`id_room`),
  KEY `id_user` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=646 DEFAULT CHARSET=cp850;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица test.rooms
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `room_name` char(30) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=387 DEFAULT CHARSET=cp850;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица test.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` char(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `expires` int(11) NOT NULL,
  `data` varchar(200) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1078 DEFAULT CHARSET=cp850;

-- Экспортируемые данные не выделены.
-- Дамп структуры для таблица test.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` char(20) CHARACTER SET utf8 NOT NULL,
  `password` char(255) CHARACTER SET utf8 NOT NULL,
  `firstName` char(25) CHARACTER SET utf8 NOT NULL,
  `lastName` char(25) CHARACTER SET utf8 NOT NULL,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1109 DEFAULT CHARSET=cp850 ROW_FORMAT=DYNAMIC;

-- Экспортируемые данные не выделены.
-- Дамп структуры для процедура test.access_mod
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `access_mod`(
	IN `login` CHAR(50),
	IN `session_id` CHAR(150)





)
BEGIN
insert into `access` set
	`user` = login,
	`session` = session_id, 
	`dateTime` = now(6);
	
END//
DELIMITER ;

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

-- Дамп структуры для процедура test.addFriendList
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `addFriendList`(
	IN `Param1` CHAR(50)CHARSET utf8,
	IN `Param2` CHAR(50)CHARSET utf8


)
    NO SQL
BEGIN
set @id=0;
set @id2=0;
set @id_f=0;
set @id_u=0;
select id  from `friendList` 
where `user` = (select id from `users` where `login` = param1) 
and `friend` = (select id from `users` where `login` = param2) into @id;
select id  from `friendList` 
where `friend` = (select id from `users` where `login` = param1) 
and `user` = (select id from `users` where `login` = param2) into @id2;
if (@id < 1 AND @id2<1)
	THEN
		select id from `users` where `login` = param1 into @id_u;
		select id from `users` where `login` = param2 into @id_f;	
		if @id_f>0 then
			insert into `friendList` set `user` = @id_u, `friend` = @id_f;
			select true as `result`;
		ELSE 
			select false as `result`;
		END IF;
ELSE 
	select false as `result`;
END IF;


END//
DELIMITER ;

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

-- Дамп структуры для процедура test.deleteUser
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteUser`(
	IN `_login` CHAR(20)CHARSET utf8,
	IN `_password` CHAR(150)

  CHARSET utf8


)
BEGIN
SELECT `id` FROM `users` WHERE `login` = _login AND `password` = _password into @id;
IF @id>0 THEN 
DELETE FROM `users` WHERE `id` = @id;
DELETE FROM `access` WHERE `user` = _login;
select true as result;
else
select false as result; 
end IF;

END//
DELIMITER ;

-- Дамп структуры для процедура test.getUsers
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `getUsers`(
	IN `userName` CHAR(50)CHARSET UTF8
)
BEGIN
select `login` from `users` WHERE `login`!=userName;
END//
DELIMITER ;

-- Дамп структуры для процедура test.loadMessage
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `loadMessage`(
	IN `id_room` INT



,
	IN `limit_mes` INT


)
    NO SQL
BEGIN
select * from (
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
ORDER BY `messages`.`date` DESC LIMIT limit_mes )t order by `date`;

END//
DELIMITER ;

-- Дамп структуры для процедура test.showRoom
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `showRoom`(IN `login` VARCHAR(20) CHARSET utf8)
    NO SQL
BEGIN
SELECT 		`room`.`id_room` AS 'id', `rooms`.`room_name` AS 'name'
FROM 
            `room`, 
            `users`, 
            `rooms`
WHERE 		`room`.`id_user` = `users`.`id` AND `room`.`id_room` = `rooms`.`id`
AND 		`users`.`login` = login 
GROUP BY 	`room`.`id_room`;
END//
DELIMITER ;

-- Дамп структуры для функция test.addUser
DELIMITER //
CREATE DEFINER=`root`@`localhost` FUNCTION `addUser`(
	`login` CHAR(20) CHARSET utf8,
	`pass` CHAR(128) CHARSET utf8,
	`firstName` CHAR(20) CHARSET utf8,
	`lastName` CHAR(20) CHARSET utf8
) RETURNS int(11)
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

-- Дамп структуры для функция test.authUsers
DELIMITER //
CREATE DEFINER=`root`@`localhost` FUNCTION `authUsers`(
	`login` CHAR(20) CHARSET UTF8,
	`pass` CHAR(128) CHARSET utf8
) RETURNS int(11)
    NO SQL
    SQL SECURITY INVOKER
BEGIN 

SELECT COUNT(id) FROM `users` WHERE
	`users`.`login` = login AND 
    `users`.`password` = pass INTO @res;
IF @res = 1 THEN 
	RETURN true;
    ELSE
    RETURN false;
END IF;    
    END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
