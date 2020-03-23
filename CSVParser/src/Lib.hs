module Lib
    ( someFunc
    ) where

newtype :: Parser a = Parser (String -> [(a, String)])

parse :: Parser a -> String -> [(a, String)]
parse (Parser p) inp = p inp

item :: Parser Char
item = Parser (\inp -> 
    case inp of
        []  -> []
        (x:xs) -> [(x,xs)])

