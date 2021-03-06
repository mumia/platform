<?php

namespace Oro\Bundle\ImportExportBundle\Tests\Unit\Reader;

use Oro\Bundle\ImportExportBundle\Reader\TemplateFixtureReader;

class TemplateFixtureReaderTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var \PHPUnit_Framework_MockObject_MockObject
     */
    protected $fixtureRegistry;

    /**
     * @var \PHPUnit_Framework_MockObject_MockObject
     */
    protected $contextRegistry;

    /**
     * @var TemplateFixtureReader
     */
    protected $reader;

    protected function setUp()
    {
        $this->fixtureRegistry = $this
            ->getMockBuilder('Oro\Bundle\ImportExportBundle\TemplateFixture\TemplateFixtureRegistry')
            ->disableOriginalConstructor()
            ->getMock();

        $this->contextRegistry = $this->getMockBuilder('Oro\Bundle\ImportExportBundle\Context\ContextRegistry')
            ->disableOriginalConstructor()
            ->getMock();

        $this->reader = new TemplateFixtureReader($this->contextRegistry, $this->fixtureRegistry);
    }

    /**
     * @expectedException \Oro\Bundle\ImportExportBundle\Exception\InvalidConfigurationException
     * @expectedExceptionMessage Configuration of fixture reader must contain "entityName".
     */
    public function testInitializeFromContextExceptionNoOption()
    {
        $context = $this->getMock('Oro\Bundle\ImportExportBundle\Context\ContextInterface');
        $context->expects($this->once())
            ->method('hasOption')
            ->with('entityName')
            ->will($this->returnValue(false));

        $stepExecution = $this->getMockBuilder('Akeneo\Bundle\BatchBundle\Entity\StepExecution')
            ->disableOriginalConstructor()
            ->getMock();
        $this->contextRegistry->expects($this->once())
            ->method('getByStepExecution')
            ->with($stepExecution)
            ->will($this->returnValue($context));

        $this->reader->setStepExecution($stepExecution);
    }

    /**
     * @expectedException \Oro\Bundle\ImportExportBundle\Exception\InvalidConfigurationException
     * @expectedExceptionMessage There is no template fixture registered for "stdClass".
     */
    public function testInitializeFromContextExceptionNoFixture()
    {
        $context = $this->getMock('Oro\Bundle\ImportExportBundle\Context\ContextInterface');
        $context->expects($this->once())
            ->method('hasOption')
            ->with('entityName')
            ->will($this->returnValue(true));
        $context->expects($this->atLeastOnce())
            ->method('getOption')
            ->with('entityName')
            ->will($this->returnValue('stdClass'));

        $stepExecution = $this->getMockBuilder('Akeneo\Bundle\BatchBundle\Entity\StepExecution')
            ->disableOriginalConstructor()
            ->getMock();
        $this->contextRegistry->expects($this->once())
            ->method('getByStepExecution')
            ->with($stepExecution)
            ->will($this->returnValue($context));

        $this->reader->setStepExecution($stepExecution);
    }

    public function testInitializeFromContext()
    {
        $context = $this->getMock('Oro\Bundle\ImportExportBundle\Context\ContextInterface');
        $context->expects($this->once())
            ->method('hasOption')
            ->with('entityName')
            ->will($this->returnValue(true));
        $context->expects($this->atLeastOnce())
            ->method('getOption')
            ->with('entityName')
            ->will($this->returnValue('stdClass'));

        $stepExecution = $this->getMockBuilder('Akeneo\Bundle\BatchBundle\Entity\StepExecution')
            ->disableOriginalConstructor()
            ->getMock();
        $this->contextRegistry->expects($this->once())
            ->method('getByStepExecution')
            ->with($stepExecution)
            ->will($this->returnValue($context));

        $iterator = new \ArrayIterator(array('test'));
        $fixture = $this->getMock('Oro\Bundle\ImportExportBundle\TemplateFixture\TemplateFixtureInterface');
        $fixture->expects($this->once())
            ->method('getData')
            ->will($this->returnValue($iterator));
        $this->fixtureRegistry->expects($this->once())
            ->method('getEntityFixture')
            ->with('stdClass')
            ->will($this->returnValue($fixture));

        $this->reader->setStepExecution($stepExecution);
        $this->assertAttributeEquals($iterator, 'sourceIterator', $this->reader);
    }
}
