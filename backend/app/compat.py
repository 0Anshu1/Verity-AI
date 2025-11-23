"""
Compatibility patches for Python 3.13+ and SQLAlchemy 2.0.44

This module patches SQLAlchemy's TypingOnly.__init_subclass__ method to handle 
new attributes introduced in Python 3.13 that cause AssertionError.

The patch intercepts the AssertionError raised when Python 3.13 adds new
attributes to Generic classes and suppresses it for this specific case.
"""
import sys
import importlib.util
from importlib.abc import MetaPathFinder

if sys.version_info >= (3, 13):
    _original_exec_module = None
    
    def _patch_sqlalchemy_langhelpers(module):
        """Patch TypingOnly in sqlalchemy.util.langhelpers module"""
        if hasattr(module, 'TypingOnly'):
            TypingOnly = module.TypingOnly
            # Get the original function (unbind from classmethod)
            original = TypingOnly.__init_subclass__.__func__ if hasattr(TypingOnly.__init_subclass__, '__func__') else TypingOnly.__init_subclass__
            
            def patched_init_subclass(cls, **kwargs):
                """Patched __init_subclass__ that suppresses Python 3.13 AssertionError"""
                try:
                    return original(cls, **kwargs)
                except AssertionError as e:
                    error_str = str(e)
                    # Suppress error if it's about Python 3.13 attributes
                    if ('__static_attributes__' in error_str or 
                        '__firstlineno__' in error_str or
                        'TypingOnly' in error_str):
                        # This is the Python 3.13 compatibility issue
                        return
                    raise
            
            # Bind as classmethod
            module.TypingOnly.__init_subclass__ = classmethod(patched_init_subclass)
    
    class SQLAlchemyPatcher(MetaPathFinder):
        """Import hook to patch SQLAlchemy modules as they load"""
        def find_spec(self, fullname, path, target=None):
            # Intercept sqlalchemy.util.langhelpers
            if fullname == 'sqlalchemy.util.langhelpers':
                # Find original spec
                for finder in sys.meta_path:
                    if finder is self:
                        continue
                    if hasattr(finder, 'find_spec'):
                        spec = finder.find_spec(fullname, path, target)
                        if spec and spec.loader:
                            # Wrap exec_module to patch after load
                            original_exec = spec.loader.exec_module
                            def patched_exec(module):
                                original_exec(module)
                                _patch_sqlalchemy_langhelpers(module)
                            spec.loader.exec_module = patched_exec
                            return spec
            return None
    
    # Install import hook
    sys.meta_path.insert(0, SQLAlchemyPatcher())
    
    # Also try to patch if already imported
    try:
        import sqlalchemy.util.langhelpers as langhelpers
        _patch_sqlalchemy_langhelpers(langhelpers)
    except (ImportError, AttributeError):
        pass

