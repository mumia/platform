<?php

namespace Oro\Bundle\EntityExtendBundle\Tools;

use Doctrine\Common\Inflector\Inflector;

class ExtendHelper
{
    /**
     * @param string $type
     *
     * @return string
     */
    public static function getReverseRelationType($type)
    {
        switch ($type) {
            case 'oneToMany':
                return 'manyToOne';
            case 'manyToOne':
                return 'oneToMany';
            case 'manyToMany':
                return 'manyToMany';
            default:
                return $type;
        }
    }

    /**
     * Returns a string that can be used as a field name to the relation to the given entity.
     *
     * To prevent name collisions this method adds a hash built based on the full class name to the association name.
     *
     * @param string $targetEntityClassName
     *
     * @return string
     */
    public static function buildAssociationName($targetEntityClassName)
    {
        return sprintf(
            '%s_%s',
            Inflector::tableize(ExtendHelper::getShortClassName($targetEntityClassName)),
            strtolower(dechex(crc32($targetEntityClassName)))
        );
    }

    /**
     * @param string $entityClassName
     * @param string $fieldName
     * @param string $fieldType
     * @param string $targetEntityClassName
     *
     * @return string
     */
    public static function buildRelationKey($entityClassName, $fieldName, $fieldType, $targetEntityClassName)
    {
        return implode('|', [$fieldType, $entityClassName, $targetEntityClassName, $fieldName]);
    }

    /**
     * Checks if an entity is a custom one
     * The custom entity is an entity which has no PHP class in any bundle. The definition of such entity is
     * created automatically in Symfony cache
     *
     * @param string $className
     *
     * @return bool
     */
    public static function isCustomEntity($className)
    {
        return strpos($className, ExtendConfigDumper::ENTITY) === 0;
    }

    /**
     * Gets the short name of the class, the part without the namespace.
     *
     * @param string $className The full name of a class
     *
     * @return string
     */
    public static function getShortClassName($className)
    {
        $lastDelimiter = strrpos($className, '\\');

        return false === $lastDelimiter
            ? $className
            : substr($className, $lastDelimiter + 1);
    }
}
