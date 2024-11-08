-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 15, 2024 at 03:31 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecoswap`
--

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `itemID` int(10) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(1000) NOT NULL,
  `ownerEmail` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`itemID`, `name`, `description`, `image`, `ownerEmail`) VALUES
(5, 'Skibidi Bag', 'The most skibidiest bag that you can imagine', '/images/skibidibag.png', 'nigga@gmail.com'),
(6, 'Sigma Shirt', 'This shirt will make you the most sigma of sigmas', '/images/1720956574620.jpg', 'mogged1000@gmail.com'),
(7, 'PP shirt', 'THEM BALLSSSS', '/images/1720956736792.png', 'nigga@gmail.com'),
(9, 'Seaweed', 'Just a pack of edible Seaweed', '/images/1721006898510.jpg', 'darren@gmail.com'),
(10, 'Paint', 'For your walls \r\nP.S. dont drink, \"taste like herbs\"', '/images/1721006973802.jpg', 'marvell@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `email` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `password` varchar(100) NOT NULL,
  `profileimage` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`email`, `name`, `password`, `profileimage`) VALUES
('atticus@gmail.com', 'Atticus', '$2b$10$ghVsfycRXBprBwcd6bpWMuWkqkgEOQNl75rpEEUXg82Smtq/Y6fAq', '/images/1721005961208.png'),
('darren@gmail.com', 'Darren', '$2b$10$tmtLF.Fc3UyBwIluhrnIl.JWm9Rvu0Ut.Zj29NIX3zRRru0EBjvtS', '/images/1721006195059.jpg'),
('marvell@gmail.com', 'Marvell', '$2b$10$vfwB/5QzyGCmLgT3cZlia.LdhqfwkNvPV1B8VBcV.KotVKDAKDj/C', '/images/1721006054033.jpeg'),
('mogged1000@gmail.com', 'Mogger', '$2b$10$TKLNiDHZo/Z8VJ1w2.st5eylY9ful5zvtbEixqVtdU1ptJWszkY16', '/images/1720956477509.png'),
('nigga@gmail.com', 'Nigga', '$2b$10$V94DGNdYvLEAirCHbtNEye/iVz20RmrlGoaEJmXWwC6pw37lgJwDm', '/images/nigga.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`itemID`),
  ADD KEY `fk_ownerEmail` (`ownerEmail`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `itemID` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `fk_ownerEmail` FOREIGN KEY (`ownerEmail`) REFERENCES `users` (`email`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
