module Lib where

import Text.Parsec.String
import Control.Applicative
import Control.Monad


matchTrue:: Parser String
matchTrue = string "true"

alwaysTrue:: Parser Bool
alwaysTrue = pure True

boolTrue:: Parser Bool
boolTrue = matchTrue *> alwaysTrue